import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import process from 'node:process';
import {validateVideoId} from '../shared/workspace';
import type {
  CommandSnapshot,
  CommandType,
  LogEntry,
  LogSource,
  Operation,
  CommandFailure,
  StartCommandRequest,
} from '../shared/command';
import {appendLog, parseRenderProgress, renderProgressPrefix, terminalOperationStatuses} from '../shared/command';

export const commandScripts: Record<CommandType, string> = {
  validate: 'validate',
  voice: 'voice',
  timeline: 'timeline',
  preview: 'preview',
  render: 'render',
};

type SpawnCommand = typeof spawn;
type RunnerEvents = {
  operation(operation: Operation): void;
  log(entry: LogEntry): void;
};
type Invocation = {command: string; args: string[]; env?: NodeJS.ProcessEnv};

export class CommandRunner {
  private operation: Operation | null = null;
  private logs: LogEntry[] = [];
  private child: ChildProcessWithoutNullStreams | null = null;
  private sequence = 0;
  private forceStopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly cwd: string,
    private readonly events: RunnerEvents,
    private readonly spawnCommand: SpawnCommand = spawn,
    private readonly verifyOutput?: (videoId: string) => Promise<unknown>,
    private readonly resolveInvocation?: (script: string, videoId: string) => Invocation,
  ) {}

  start(request: StartCommandRequest): Operation {
    const validationError = validateVideoId(request.videoId);
    if (validationError) {
      throw new Error(validationError.message);
    }
    if (!(request.command in commandScripts)) {
      throw new Error('許可されていないコマンドです。');
    }
    if (this.operation && !terminalOperationStatuses.has(this.operation.status)) {
      throw new Error('別の操作を実行中です。');
    }

    this.logs = [];
    this.sequence = 0;
    this.operation = {
      id: `${Date.now()}-${request.command}`,
      videoId: request.videoId,
      command: request.command,
      phase: request.command === 'validate' ? 'command' : 'preflight',
      status: request.command === 'validate' ? 'running' : 'validating',
      startedAt: new Date().toISOString(),
    };
    this.emitOperation();
    void this.execute(request);
    return this.operation;
  }

  snapshot(): CommandSnapshot {
    return {operation: this.operation, logs: [...this.logs]};
  }

  clearLogs(operationId: string): boolean {
    if (this.operation?.id !== operationId) {
      return false;
    }
    this.logs = [];
    return true;
  }

  stop(operationId: string): boolean {
    if (
      this.operation?.id !== operationId ||
      terminalOperationStatuses.has(this.operation.status) ||
      !this.child
    ) {
      return false;
    }
    this.operation = {...this.operation, status: 'stopping'};
    this.emitOperation();
    this.addLog('system', '停止を要求しました。生成途中のファイルが残る場合があります。');
    this.killProcess('SIGTERM');
    this.forceStopTimer = setTimeout(() => this.killProcess('SIGKILL'), 10_000);
    return true;
  }

  private async execute(request: StartCommandRequest): Promise<void> {
    try {
      if (request.command !== 'validate') {
        const valid = await this.runScript('validate', request.videoId);
        if (!valid || this.operation?.status === 'stopping') {
          this.finish(this.operation?.status === 'stopping' ? 'cancelled' : 'failed');
          return;
        }
        this.operation = {...this.operation!, phase: 'command', status: 'running'};
        this.emitOperation();
      }

      const succeeded = await this.runScript(commandScripts[request.command], request.videoId);
      if (this.operation?.status === 'stopping') {
        this.finish('cancelled');
        return;
      }
      if (!succeeded) {
        this.finish('failed');
        return;
      }
      if (request.command === 'render' && this.verifyOutput) {
        try {
          await this.verifyOutput(request.videoId);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.addLog('system', `${message} Partial outputは自動削除されません。`);
          this.finish('failed', 'output-verification-failed', message);
          return;
        }
      }
      this.finish('succeeded');
    } catch (caught) {
      this.finish('failed', 'spawn-failed', caught instanceof Error ? caught.message : String(caught));
    }
  }

  private runScript(script: string, videoId: string): Promise<boolean> {
    this.addLog('system', `npm run ${script} -- ${videoId}`);
    return new Promise((resolve, reject) => {
      const invocation = this.resolveInvocation?.(script, videoId) ?? {
        command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
        args: ['run', script, '--', videoId],
      };
      const child = this.spawnCommand(invocation.command, invocation.args, {
        cwd: this.cwd,
        detached: process.platform !== 'win32',
        shell: false,
        env: {...process.env, ...invocation.env},
      });
      this.child = child;
      this.pipeLines(child.stdout, 'stdout');
      this.pipeLines(child.stderr, 'stderr');
      let settled = false;
      child.once('error', (error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      });
      child.once('close', (code, signal) => {
        if (settled) {
          return;
        }
        settled = true;
        this.child = null;
        if (signal) {
          this.addLog('system', `process stopped by ${signal}`);
        } else if (code !== 0) {
          this.addLog('system', `process exited with code ${code ?? 'unknown'}`);
          if (this.operation) {
            this.operation = {...this.operation, failure: 'command-failed'};
          }
        }
        resolve(code === 0);
      });
    });
  }

  private pipeLines(stream: NodeJS.ReadableStream, source: LogSource): void {
    let pending = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk: string) => {
      pending += chunk;
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? '';
      lines.forEach((line) => this.consumeLine(source, line));
    });
    stream.on('end', () => {
      if (pending) {
        this.consumeLine(source, pending);
      }
    });
  }

  private killProcess(signal: NodeJS.Signals): void {
    const pid = this.child?.pid;
    if (!pid) {
      return;
    }
    try {
      process.kill(process.platform === 'win32' ? pid : -pid, signal);
    } catch (caught) {
      this.addLog('system', `停止処理に失敗しました: ${caught instanceof Error ? caught.message : String(caught)}`);
    }
  }

  private finish(status: 'succeeded' | 'failed' | 'cancelled', failure?: CommandFailure, error?: string): void {
    if (!this.operation) {
      return;
    }
    if (this.forceStopTimer) {
      clearTimeout(this.forceStopTimer);
      this.forceStopTimer = null;
    }
    this.child = null;
    this.operation = {
      ...this.operation,
      status,
      endedAt: new Date().toISOString(),
      failure: failure ?? this.operation.failure,
      error,
    };
    this.emitOperation();
  }

  private consumeLine(source: LogSource, text: string): void {
    if (source === 'stdout' && text.startsWith(renderProgressPrefix)) {
      const progress = parseRenderProgress(text);
      if (progress && this.operation?.command === 'render') {
        this.operation = {...this.operation, progress};
        this.emitOperation();
        return;
      }
      this.addLog('system', `Render progress recordを解析できません: ${text}`);
      return;
    }
    this.addLog(source, text);
  }

  private addLog(source: LogSource, text: string): void {
    if (!this.operation || !text) {
      return;
    }
    const entry: LogEntry = {
      operationId: this.operation.id,
      sequence: ++this.sequence,
      timestamp: new Date().toISOString(),
      source,
      text,
    };
    this.logs = appendLog(this.logs, entry);
    this.events.log(entry);
  }

  private emitOperation(): void {
    if (this.operation) {
      this.events.operation(this.operation);
    }
  }
}

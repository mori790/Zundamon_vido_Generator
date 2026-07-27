import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createChatMessage, type CodexConnectionState, type CodexUserInput} from '../shared/chat';
import {
  encodeRpc,
  isApprovalMethod,
  hasRequestCapacity,
  parseRpcLine,
  validatePrompt,
  type CodexApproval,
  type CodexEvent,
  type RpcMessage,
} from '../shared/codex-app-server';

type Pending = {resolve(value: unknown): void; reject(error: Error): void; timer: NodeJS.Timeout};
type Session = {threadId: string};

export class CodexAppServerService {
  private child: ChildProcessWithoutNullStreams | null = null;
  private buffer = '';
  private id = 0;
  private pending = new Map<number, Pending>();
  private approvals = new Map<string, {requestId: number; approval: CodexApproval; timer: NodeJS.Timeout}>();
  private listeners = new Set<(event: CodexEvent) => void>();
  private threadId: string | null = null;
  private turnId: string | null = null;
  private assistant = '';
  private videoId: string | null = null;
  private diagnostics: string[] = [];

  constructor(
    private readonly root = process.cwd(),
    private readonly executable: {command: string; args: string[]} = {command: 'codex', args: ['app-server']},
    private readonly approvalTimeoutMs = 5 * 60_000,
  ) {}

  get isConnected(): boolean {
    return this.threadId !== null;
  }

  getDiagnostics(): string[] {
    return [...this.diagnostics];
  }

  onEvent(listener: (event: CodexEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async connect(videoId: string): Promise<CodexConnectionState> {
    this.videoId = videoId;
    this.emit({type: 'connection', state: {status: 'connecting'}});
    let lastError: unknown;
    for (const delay of [0, 500, 1000, 2000]) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        await this.ensureProcess();
        const saved = await this.loadSession(videoId);
        if (saved) {
          try {
            const resumed = await this.request('thread/resume', {threadId: saved.threadId});
            this.threadId = readId(resumed, 'thread');
          } catch {
            this.threadId = null;
          }
        }
        if (!this.threadId) await this.startNewThread(videoId);
        const state: CodexConnectionState = {status: 'connected'};
        this.emit({type: 'connection', state});
        return state;
      } catch (error) {
        lastError = error;
        this.record(error);
        this.child?.kill();
        this.child = null;
      }
    }
    const state: CodexConnectionState = {
      status: 'error',
      message: lastError instanceof Error ? lastError.message : String(lastError),
    };
    this.emit({type: 'connection', state});
    return state;
  }

  async send(input: CodexUserInput): Promise<void> {
    if (!this.threadId || this.turnId) throw new Error(this.turnId ? 'Codex turn is already active.' : 'Codex is not connected.');
    const prompt = validatePrompt(input.message);
    this.assistant = '';
    const result = await this.request('turn/start', {
      threadId: this.threadId,
      input: [{type: 'text', text: prompt}],
      cwd: this.root,
      approvalPolicy: 'on-request',
      sandboxPolicy: {type: 'workspaceWrite', writableRoots: [this.root]},
    }, 10 * 60_000);
    this.turnId = readId(result, 'turn');
  }

  async interrupt(): Promise<void> {
    if (this.threadId && this.turnId) {
      await this.request('turn/interrupt', {threadId: this.threadId, turnId: this.turnId});
    }
  }

  async reconnect(videoId: string): Promise<CodexConnectionState> {
    await this.disconnect();
    return this.connect(videoId);
  }

  async startNewThread(videoId = this.videoId): Promise<void> {
    if (!videoId) throw new Error('Workspace is not selected.');
    const result = await this.request('thread/start', {
      cwd: this.root,
      approvalPolicy: 'on-request',
      sandbox: 'workspace-write',
    });
    this.threadId = readId(result, 'thread');
    await this.saveSession(videoId, {threadId: this.threadId});
  }

  async respondApproval(id: string, approved: boolean): Promise<void> {
    const pending = this.approvals.get(id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.approvals.delete(id);
    this.write({id: pending.requestId, result: approved ? {decision: 'accept'} : {decision: 'decline'}});
  }

  async disconnect(): Promise<void> {
    for (const [id] of this.approvals) await this.respondApproval(id, false);
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Codex App Server disconnected.'));
    }
    this.pending.clear();
    this.child?.kill();
    this.child = null;
    this.threadId = null;
    this.turnId = null;
  }

  private async ensureProcess(): Promise<void> {
    if (this.child) return;
    const child = spawn(this.executable.command, this.executable.args, {cwd: this.root, stdio: 'pipe'});
    this.child = child;
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => this.consume(chunk));
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      const text = chunk.trim();
      if (text) {
        this.record(`[stderr] ${text}`);
        console.error('[codex-app-server stderr]', text);
      }
    });
    child.on('exit', () => {
      if (this.child === child) void this.handleExit();
    });
    child.on('error', (error) => this.failAll(error));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Codex App Server start timed out.')), 5000);
      child.once('spawn', () => {
        clearTimeout(timer);
        resolve();
      });
      child.once('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
    await this.request('initialize', {
      clientInfo: {name: 'zundamon-studio', title: 'Zundamon Studio', version: '0.1.0'},
      capabilities: {experimentalApi: false},
    }, 10_000);
    this.write({method: 'initialized'});
  }

  private request(method: string, params?: unknown, timeoutMs = 10_000): Promise<unknown> {
    if (!this.child) throw new Error('Codex App Server is not running.');
    if (!hasRequestCapacity(this.pending.size)) throw new Error('Codex request capacity reached.');
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out.`));
      }, timeoutMs);
      this.pending.set(id, {resolve, reject, timer});
      this.write({id, method, params});
    });
  }

  private write(message: RpcMessage): void {
    if (!this.child?.stdin.writable) throw new Error('Codex App Server is not writable.');
    this.child.stdin.write(encodeRpc(message));
  }

  private consume(chunk: string): void {
    this.buffer += chunk;
    for (;;) {
      const newline = this.buffer.indexOf('\n');
      if (newline < 0) return;
      const line = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 1);
      if (!line.trim()) continue;
      try {
        this.handle(parseRpcLine(line));
      } catch (error) {
        this.failAll(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  private handle(message: RpcMessage): void {
    if ('id' in message && !('method' in message)) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message ?? 'Codex request failed.'));
      else pending.resolve(message.result);
      return;
    }
    if ('method' in message && 'id' in message) {
      if (!isApprovalMethod(message.method)) {
        this.write({id: message.id, result: {decision: 'decline'}});
        return;
      }
      const id = String(message.id);
      const approval: CodexApproval = {id, method: message.method, summary: approvalSummary(message.params), status: 'pending'};
      const timer = setTimeout(() => void this.respondApproval(id, false), this.approvalTimeoutMs);
      this.approvals.set(id, {requestId: message.id, approval, timer});
      this.emit({type: 'approval', approval});
      return;
    }
    if ('method' in message) this.handleNotification(message.method, message.params);
  }

  private handleNotification(method: string, params: unknown): void {
    if (method.includes('agentMessage') && method.endsWith('/delta')) {
      const delta = readString(params, 'delta');
      if (delta) {
        this.assistant += delta;
        this.emit({type: 'delta', text: delta});
      }
      return;
    }
    if (method === 'turn/completed') {
      const status = readTurnStatus(params);
      const failed = status !== 'completed';
      this.record(`[turn/completed] status=${status}`);
      console.log('[codex-app-server turn/completed]', JSON.stringify(params));
      this.turnId = null;
      if (failed) {
        const errorMessage = readTurnError(params);
        this.emit({type: 'turn-failed', message: errorMessage ?? 'Codex turn did not complete.'});
      } else {
        this.emit({type: 'turn-completed', message: createChatMessage('assistant', this.assistant)});
      }
    }
  }

  private handleExit(): void {
    this.child = null;
    this.failAll(new Error('Codex App Server exited.'));
    this.emit({type: 'connection', state: {status: 'disconnected', message: 'Codex App Server exited.'}});
  }

  private failAll(error: Error): void {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }

  private emit(event: CodexEvent): void {
    this.record(event.type);
    for (const listener of this.listeners) listener(event);
  }

  private record(value: unknown): void {
    const text = String(value instanceof Error ? value.message : value)
      .replace(/(?:sk-|sess-)[a-zA-Z0-9_-]+/g, '[REDACTED]')
      .slice(0, 1000);
    this.diagnostics.push(text);
    if (this.diagnostics.length > 2000) this.diagnostics.shift();
  }

  private async loadSession(videoId: string): Promise<Session | null> {
    try {
      const value: unknown = JSON.parse(await readFile(this.sessionPath(videoId), 'utf8'));
      return value && typeof value === 'object' && typeof (value as Session).threadId === 'string' ? value as Session : null;
    } catch {
      return null;
    }
  }

  private async saveSession(videoId: string, session: Session): Promise<void> {
    const target = this.sessionPath(videoId);
    await mkdir(path.dirname(target), {recursive: true});
    const temp = `${target}.tmp`;
    await writeFile(temp, JSON.stringify(session, null, 2), {mode: 0o600});
    await rename(temp, target);
  }

  private sessionPath(videoId: string): string {
    const safe = videoId.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(this.root, 'generated', 'studio', safe, 'codex-session.json');
  }
}

function readId(value: unknown, key: string): string {
  const id = value && typeof value === 'object' && (value as Record<string, unknown>)[key];
  const nested = id && typeof id === 'object' ? (id as {id?: unknown}).id : id;
  if (typeof nested !== 'string') throw new Error(`Codex response missing ${key} id.`);
  return nested;
}

function readString(value: unknown, key: string): string {
  return value && typeof value === 'object' && typeof (value as Record<string, unknown>)[key] === 'string'
    ? (value as Record<string, string>)[key]
    : '';
}

function readTurnStatus(value: unknown): string {
  const turn = value && typeof value === 'object' ? (value as {turn?: unknown}).turn : undefined;
  return turn && typeof turn === 'object' && typeof (turn as {status?: unknown}).status === 'string'
    ? String((turn as {status: string}).status)
    : 'completed';
}

function readTurnError(value: unknown): string | null {
  const turn = value && typeof value === 'object' ? (value as {turn?: unknown}).turn : undefined;
  const error = turn && typeof turn === 'object' ? (turn as {error?: unknown}).error : undefined;
  return error && typeof error === 'object' && typeof (error as {message?: unknown}).message === 'string'
    ? (error as {message: string}).message
    : null;
}

function approvalSummary(params: unknown): string {
  if (!params || typeof params !== 'object') return 'Codex requests a workspace mutation.';
  const value = params as Record<string, unknown>;
  return String(value.command ?? value.reason ?? value.filePath ?? 'Codex requests a workspace mutation.').slice(0, 500);
}

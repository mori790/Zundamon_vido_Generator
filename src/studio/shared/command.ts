import type {CommandOperation} from './proposal';

export type CommandType = CommandOperation;
export type CommandPhase = 'preflight' | 'command';
export type OperationStatus =
  | 'validating'
  | 'running'
  | 'stopping'
  | 'succeeded'
  | 'failed'
  | 'cancelled';
export type CommandFailure = 'spawn-failed' | 'command-failed' | 'output-verification-failed';
export type LogSource = 'stdout' | 'stderr' | 'system';

export type Operation = {
  id: string;
  videoId: string;
  command: CommandType;
  phase: CommandPhase;
  status: OperationStatus;
  startedAt: string;
  endedAt?: string;
  failure?: CommandFailure;
  error?: string;
  progress?: RenderProgress;
};

export type RenderProgress = {
  renderedFrames: number;
  totalFrames: number;
  fraction: number;
  etaSeconds?: number;
};

export type LogEntry = {
  operationId: string;
  sequence: number;
  timestamp: string;
  source: LogSource;
  text: string;
};

export type CommandSnapshot = {
  operation: Operation | null;
  logs: LogEntry[];
};

export type StartCommandRequest = {
  videoId: string;
  command: CommandType;
};

export type CommandApi = {
  start(request: StartCommandRequest): Promise<Operation>;
  stop(operationId: string): Promise<boolean>;
  clearLogs(operationId: string): Promise<boolean>;
  snapshot(): Promise<CommandSnapshot>;
  onOperation(listener: (operation: Operation) => void): () => void;
  onLog(listener: (entry: LogEntry) => void): () => void;
};

export const terminalOperationStatuses = new Set<OperationStatus>(['succeeded', 'failed', 'cancelled']);
export const renderProgressPrefix = '__ZUNDAMON_RENDER_PROGRESS__';

export function serializeRenderProgress(progress: RenderProgress): string {
  return `${renderProgressPrefix}${JSON.stringify(progress)}`;
}

export function parseRenderProgress(line: string): RenderProgress | null {
  if (!line.startsWith(renderProgressPrefix)) return null;
  try {
    const value = JSON.parse(line.slice(renderProgressPrefix.length)) as Partial<RenderProgress>;
    if (
      !Number.isInteger(value.renderedFrames)
      || !Number.isInteger(value.totalFrames)
      || value.renderedFrames! < 0
      || value.totalFrames! <= 0
      || typeof value.fraction !== 'number'
      || !Number.isFinite(value.fraction)
      || value.fraction < 0
      || value.fraction > 1
      || (
        value.etaSeconds !== undefined
        && (typeof value.etaSeconds !== 'number' || !Number.isFinite(value.etaSeconds) || value.etaSeconds < 0)
      )
    ) {
      return null;
    }
    return value as RenderProgress;
  } catch {
    return null;
  }
}

export function appendLog(logs: LogEntry[], entry: LogEntry, limit = 1000): LogEntry[] {
  return [...logs, entry].slice(-limit);
}

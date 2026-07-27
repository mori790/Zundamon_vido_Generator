import type {
  CommandApi,
  CommandSnapshot,
  LogEntry,
  Operation,
  StartCommandRequest,
} from '../shared/command';

declare global {
  var commandApi: CommandApi | undefined;
}

function api(): CommandApi {
  if (!globalThis.commandApi) {
    throw new Error('Command Runner未接続');
  }
  return globalThis.commandApi;
}

export const commandClient = {
  async start(request: StartCommandRequest): Promise<Operation> {
    return api().start(request);
  },
  stop(operationId: string): Promise<boolean> {
    return api().stop(operationId);
  },
  clearLogs(operationId: string): Promise<boolean> {
    return api().clearLogs(operationId);
  },
  snapshot(): Promise<CommandSnapshot> {
    return globalThis.commandApi?.snapshot() ?? Promise.resolve({operation: null, logs: []});
  },
  onOperation(listener: (operation: Operation) => void): () => void {
    return globalThis.commandApi?.onOperation(listener) ?? (() => undefined);
  },
  onLog(listener: (entry: LogEntry) => void): () => void {
    return globalThis.commandApi?.onLog(listener) ?? (() => undefined);
  },
};

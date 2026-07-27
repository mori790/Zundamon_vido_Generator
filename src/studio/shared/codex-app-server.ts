import type {ChatMessage, CodexConnectionState, CodexUserInput} from './chat';

export const CODEX_MAX_LINE_BYTES = 1024 * 1024;
export const CODEX_MAX_PROMPT_BYTES = 64 * 1024;
export const CODEX_MAX_PENDING_REQUESTS = 128;

export type CodexApproval = {
  id: string;
  method: string;
  summary: string;
  status: 'pending' | 'approved' | 'denied';
};

export type CodexEvent =
  | {type: 'connection'; state: CodexConnectionState}
  | {type: 'delta'; text: string}
  | {type: 'approval'; approval: CodexApproval}
  | {type: 'turn-completed'; message: ChatMessage}
  | {type: 'turn-failed'; message: string};

export type CodexApi = {
  connect(videoId: string): Promise<CodexConnectionState>;
  send(input: CodexUserInput): Promise<void>;
  interrupt(): Promise<void>;
  reconnect(videoId: string): Promise<CodexConnectionState>;
  startNewThread(videoId: string): Promise<void>;
  respondApproval(id: string, approved: boolean): Promise<void>;
  disconnect(): Promise<void>;
  onEvent(listener: (event: CodexEvent) => void): () => void;
};

export type RpcRequest = {id: number; method: string; params?: unknown};
export type RpcResponse = {id: number; result?: unknown; error?: {message?: string}};
export type RpcNotification = {method: string; params?: unknown};
export type RpcMessage = RpcRequest | RpcResponse | RpcNotification;

export function encodeRpc(message: RpcMessage): string {
  const line = `${JSON.stringify(message)}\n`;
  if (new TextEncoder().encode(line).byteLength > CODEX_MAX_LINE_BYTES) {
    throw new Error('Codex App Server message exceeds 1 MiB.');
  }
  return line;
}

export function parseRpcLine(line: string): RpcMessage {
  if (new TextEncoder().encode(line).byteLength > CODEX_MAX_LINE_BYTES) {
    throw new Error('Codex App Server message exceeds 1 MiB.');
  }
  const value: unknown = JSON.parse(line);
  if (!value || typeof value !== 'object') throw new Error('Invalid Codex App Server message.');
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.method === 'string') {
    if (candidate.id === undefined) return {method: candidate.method, params: candidate.params};
    if (typeof candidate.id === 'number') return {id: candidate.id, method: candidate.method, params: candidate.params};
  }
  if (typeof candidate.id === 'number' && ('result' in candidate || 'error' in candidate)) {
    const error = candidate.error && typeof candidate.error === 'object'
      ? {message: String((candidate.error as {message?: unknown}).message ?? 'Codex request failed.')}
      : undefined;
    return {id: candidate.id, result: candidate.result, error};
  }
  throw new Error('Invalid Codex App Server message.');
}

export function validatePrompt(message: string): string {
  const prompt = message.trim();
  if (!prompt) throw new Error('メッセージを入力してください。');
  if (new TextEncoder().encode(prompt).byteLength > CODEX_MAX_PROMPT_BYTES) {
    throw new Error('メッセージは64 KiB以下にしてください。');
  }
  return prompt;
}

export function isApprovalMethod(method: string): boolean {
  return method.endsWith('/requestApproval') || method.includes('requestApproval');
}

export function hasRequestCapacity(pending: number): boolean {
  return Number.isInteger(pending) && pending >= 0 && pending < CODEX_MAX_PENDING_REQUESTS;
}

export function transitionTurn(
  current: 'idle' | 'active' | 'completed' | 'failed' | 'interrupted',
  next: 'active' | 'completed' | 'failed' | 'interrupted',
): typeof next {
  if (current === 'completed' || current === 'failed' || current === 'interrupted') return current;
  if (current === 'idle' && next !== 'active') throw new Error('Turn must become active before terminal.');
  return next;
}

export function settleApproval(
  current: 'pending' | 'approved' | 'denied',
  approved: boolean,
): 'approved' | 'denied' {
  if (current !== 'pending') return current;
  return approved ? 'approved' : 'denied';
}

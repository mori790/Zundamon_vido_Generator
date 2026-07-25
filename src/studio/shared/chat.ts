export type CodexConnectionMode = 'mock' | 'real';

export type CodexConnectionState =
  | {status: 'mock-ready'}
  | {status: 'connecting'}
  | {status: 'connected'}
  | {status: 'disconnected'; message: string}
  | {status: 'error'; message: string};

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatSession = {
  videoId: string;
  messages: ChatMessage[];
  connectionMode: CodexConnectionMode;
  connectionState: CodexConnectionState;
};

export type CodexUserInput = {
  videoId: string;
  message: string;
  context?: {
    workspaceMode: 'existing-script' | 'empty-draft';
    title?: string;
  };
};

export type CodexConnection = {
  connect(): Promise<CodexConnectionState>;
  sendMessage(input: CodexUserInput): Promise<ChatMessage>;
  disconnect(): Promise<void>;
};

export function validateUserMessage(input: string): string | null {
  const message = input.trim();
  return message.length > 0 ? message : null;
}

export function createChatMessage(
  role: ChatRole,
  content: string,
  options: {id?: string; createdAt?: string} = {},
): ChatMessage {
  return {
    id: options.id ?? `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}

export function appendChatMessage(messages: ChatMessage[], message: ChatMessage): ChatMessage[] {
  return [...messages, message];
}


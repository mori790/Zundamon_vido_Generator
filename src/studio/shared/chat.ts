import {isProposal, isTerminalProposal, type Proposal, type StructuredProposalInput} from './proposal';

export const MAX_CHAT_HISTORY_BYTES = 10 * 1024 * 1024;

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
  structuredProposals?: StructuredProposalInput[];
};

export type ChatHistory = {
  messages: ChatMessage[];
  proposals: Proposal[];
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

export function parseChatHistory(value: unknown): ChatHistory {
  if (Array.isArray(value)) {
    return {messages: value.filter(isChatMessage), proposals: []};
  }
  if (!value || typeof value !== 'object') {
    return {messages: [], proposals: []};
  }
  const candidate = value as Partial<ChatHistory>;
  return {
    messages: Array.isArray(candidate.messages) ? candidate.messages.filter(isChatMessage) : [],
    proposals: Array.isArray(candidate.proposals) ? candidate.proposals.filter(isProposal) : [],
  };
}

export function compactChatHistory(
  history: ChatHistory,
  maxBytes = MAX_CHAT_HISTORY_BYTES,
): ChatHistory {
  let next: ChatHistory = {
    messages: [...history.messages],
    proposals: [...history.proposals],
  };

  while (serializedBytes(next) > maxBytes) {
    const removable = next.proposals
      .filter(isTerminalProposal)
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))[0];
    if (!removable) {
      throw new Error('チャット履歴が保存上限を超えています。未処理の提案は削除されません。');
    }
    const proposals = next.proposals.filter((proposal) => proposal.id !== removable.id);
    const messageStillReferenced = proposals.some((proposal) => proposal.messageId === removable.messageId);
    next = {
      proposals,
      messages: messageStillReferenced
        ? next.messages
        : next.messages.filter((message) => message.id !== removable.messageId),
    };
  }

  return next;
}

export function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<ChatMessage>;
  return (
    typeof candidate.id === 'string' &&
    (candidate.role === 'user' || candidate.role === 'assistant' || candidate.role === 'system') &&
    typeof candidate.content === 'string' &&
    typeof candidate.createdAt === 'string' &&
    (candidate.structuredProposals === undefined || Array.isArray(candidate.structuredProposals))
  );
}

function serializedBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

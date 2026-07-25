import type {ChatMessage} from '../shared/chat';

type FileSystemAccess = {
  mkdir(path: string, options?: {recursive?: boolean}): Promise<void>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
};

type NodeRequire = (id: string) => unknown;

declare global {
  interface Window {
    require?: NodeRequire;
  }
}

const browserFs = (): FileSystemAccess => {
  const require = window.require;
  if (!require) {
    throw new Error('Local file access is unavailable in this renderer.');
  }
  const fs = require('node:fs/promises') as typeof import('node:fs/promises');
  return {
    async mkdir(path, options) {
      await fs.mkdir(path, options);
    },
    async readFile(path) {
      return fs.readFile(path, 'utf8');
    },
    writeFile: fs.writeFile as unknown as FileSystemAccess['writeFile'],
  };
};

function safeVideoId(videoId: string): string {
  return videoId.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function chatHistoryPath(videoId: string): string {
  return `generated/studio/${safeVideoId(videoId)}/chat-history.json`;
}

function chatHistoryDir(videoId: string): string {
  return `generated/studio/${safeVideoId(videoId)}`;
}

export async function loadChatHistory(videoId: string, fsAccess?: FileSystemAccess): Promise<ChatMessage[]> {
  const fs = fsAccess ?? browserFs();
  try {
    const source = await fs.readFile(chatHistoryPath(videoId));
    const parsed = JSON.parse(source) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isChatMessage);
  } catch {
    return [];
  }
}

export async function saveChatHistory(
  videoId: string,
  messages: ChatMessage[],
  fsAccess?: FileSystemAccess,
): Promise<void> {
  const fs = fsAccess ?? browserFs();
  await fs.mkdir(chatHistoryDir(videoId), {recursive: true});
  await fs.writeFile(chatHistoryPath(videoId), JSON.stringify(messages, null, 2));
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<ChatMessage>;
  return (
    typeof candidate.id === 'string' &&
    (candidate.role === 'user' || candidate.role === 'assistant' || candidate.role === 'system') &&
    typeof candidate.content === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}

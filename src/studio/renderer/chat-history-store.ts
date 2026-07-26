import {
  compactChatHistory,
  parseChatHistory,
  type ChatHistory,
} from '../shared/chat';

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

export async function loadChatHistory(videoId: string, fsAccess?: FileSystemAccess): Promise<ChatHistory> {
  try {
    const fs = fsAccess ?? browserFs();
    const source = await fs.readFile(chatHistoryPath(videoId));
    return parseChatHistory(JSON.parse(source));
  } catch {
    return {messages: [], proposals: []};
  }
}

export async function saveChatHistory(
  videoId: string,
  history: ChatHistory,
  fsAccess?: FileSystemAccess,
): Promise<void> {
  const fs = fsAccess ?? browserFs();
  await fs.mkdir(chatHistoryDir(videoId), {recursive: true});
  await fs.writeFile(chatHistoryPath(videoId), JSON.stringify(compactChatHistory(history), null, 2));
}

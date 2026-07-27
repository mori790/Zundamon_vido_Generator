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

const browserFs = (): FileSystemAccess => {
  const api = globalThis.localFileApi;
  if (!api) {
    throw new Error('Local file access is unavailable in this renderer.');
  }
  return {
    async mkdir() {},
    async readFile(path) {
      const videoId = path.split('/').at(-2) ?? '';
      const source = await api.chat.read(videoId);
      if (source === null) throw Object.assign(new Error('Not found'), {code: 'ENOENT'});
      return source;
    },
    async writeFile(path, data) {
      await api.chat.write(path.split('/').at(-2) ?? '', data);
    },
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

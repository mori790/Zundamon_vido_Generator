import {describe, expect, it} from 'vitest';
import {
  appendChatMessage,
  createChatMessage,
  validateUserMessage,
  type ChatMessage,
} from '../../src/studio/shared/chat';
import {chatHistoryPath, loadChatHistory, saveChatHistory} from '../../src/studio/renderer/chat-history-store';
import {MockCodexConnection} from '../../src/studio/renderer/mock-codex-connection';

describe('chat state utilities', () => {
  it('rejects empty messages and trims valid messages', () => {
    expect(validateUserMessage('')).toBeNull();
    expect(validateUserMessage('   ')).toBeNull();
    expect(validateUserMessage('  企画を相談したい  ')).toBe('企画を相談したい');
  });

  it('creates messages and appends in order', () => {
    const first = createChatMessage('user', '最初', {
      id: 'user-1',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    const second = createChatMessage('assistant', '次', {
      id: 'assistant-1',
      createdAt: '2026-07-25T00:00:01.000Z',
    });

    expect(first).toEqual({
      id: 'user-1',
      role: 'user',
      content: '最初',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    expect(appendChatMessage([first], second)).toEqual([first, second]);
  });
});

describe('MockCodexConnection', () => {
  it('reports mock-ready and returns planning-oriented response', async () => {
    const connection = new MockCodexConnection(0);

    await expect(connection.connect()).resolves.toEqual({status: 'mock-ready'});
    await expect(
      connection.sendMessage({
        videoId: 'sample-video',
        message: '企画を相談したい',
        context: {
          workspaceMode: 'existing-script',
          title: 'Podを削除しても復活する理由',
        },
      }),
    ).resolves.toMatchObject({
      role: 'assistant',
      content: expect.stringContaining('Mock:'),
    });
  });
});

describe('chat history store', () => {
  it('keeps chat history outside input scripts', () => {
    expect(chatHistoryPath('../sample-video')).toBe('generated/studio/.._sample-video/chat-history.json');
  });

  it('loads and saves chat history through injected file access', async () => {
    const writes = new Map<string, string>();
    const fsAccess = {
      async mkdir() {
        return;
      },
      async readFile(path: string) {
        const value = writes.get(path);
        if (!value) {
          throw new Error('missing');
        }
        return value;
      },
      async writeFile(path: string, data: string) {
        writes.set(path, data);
      },
    };
    const message: ChatMessage = {
      id: 'user-1',
      role: 'user',
      content: '相談',
      createdAt: '2026-07-25T00:00:00.000Z',
    };

    await saveChatHistory('sample-video', [message], fsAccess);

    await expect(loadChatHistory('sample-video', fsAccess)).resolves.toEqual([message]);
  });
});

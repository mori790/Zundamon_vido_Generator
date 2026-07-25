import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CodexPanel} from '../../src/studio/renderer/CodexPanel';
import {
  createChatMessage,
  type ChatMessage,
  type CodexConnection,
  type CodexConnectionState,
  type CodexUserInput,
} from '../../src/studio/shared/chat';

function createConnection(): CodexConnection & {sendMessage: ReturnType<typeof vi.fn>} {
  return {
    connect: vi.fn<() => Promise<CodexConnectionState>>().mockResolvedValue({status: 'mock-ready'}),
    sendMessage: vi.fn<(input: CodexUserInput) => Promise<ChatMessage>>().mockImplementation(async (input) =>
      createChatMessage('assistant', `Mock: ${input.message}`),
    ),
    disconnect: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}

function createHistoryStore(initialMessages: ChatMessage[] = []) {
  return {
    load: vi.fn<(videoId: string) => Promise<ChatMessage[]>>().mockResolvedValue(initialMessages),
    save: vi.fn<(videoId: string, messages: ChatMessage[]) => Promise<void>>().mockResolvedValue(undefined),
  };
}

describe('CodexPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows explicit Mock status', async () => {
    render(
      <CodexPanel
        connection={createConnection()}
        historyStore={createHistoryStore()}
        videoId="sample-video"
        workspaceMode="existing-script"
      />,
    );

    expect(await screen.findByTestId('codex-connection-status')).toHaveTextContent('Mock');
  });

  it('submits user message and renders assistant response', async () => {
    const connection = createConnection();
    const historyStore = createHistoryStore();

    render(
      <CodexPanel
        connection={connection}
        historyStore={historyStore}
        title="Sample"
        videoId="sample-video"
        workspaceMode="existing-script"
      />,
    );

    await screen.findByText('企画、構成、対象者、尺について相談できます。');
    fireEvent.change(screen.getByTestId('codex-chat-input'), {
      target: {value: '初心者向けの構成を考えたい'},
    });
    fireEvent.click(screen.getByTestId('codex-chat-send-button'));

    expect(await screen.findByTestId('codex-message-user')).toHaveTextContent('初心者向けの構成を考えたい');
    expect(await screen.findByTestId('codex-message-assistant')).toHaveTextContent(
      'Mock: 初心者向けの構成を考えたい',
    );
    expect(connection.sendMessage).toHaveBeenCalledWith({
      videoId: 'sample-video',
      message: '初心者向けの構成を考えたい',
      context: {
        workspaceMode: 'existing-script',
        title: 'Sample',
      },
    });
    expect(historyStore.save).toHaveBeenCalled();
  });

  it('does not send an empty message', async () => {
    const connection = createConnection();

    render(
      <CodexPanel
        connection={connection}
        historyStore={createHistoryStore()}
        videoId="sample-video"
        workspaceMode="empty-draft"
      />,
    );

    await screen.findByTestId('codex-connection-status');
    fireEvent.change(screen.getByTestId('codex-chat-input'), {
      target: {value: '   '},
    });
    fireEvent.click(screen.getByTestId('codex-chat-send-button'));

    await waitFor(() => {
      expect(connection.sendMessage).not.toHaveBeenCalled();
    });
  });
});

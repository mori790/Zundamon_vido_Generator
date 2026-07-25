import {useEffect, useMemo, useState} from 'react';
import {
  appendChatMessage,
  createChatMessage,
  validateUserMessage,
  type ChatMessage,
  type CodexConnection,
  type CodexConnectionState,
} from '../shared/chat';
import type {WorkspaceMode} from '../shared/workspace';
import {loadChatHistory, saveChatHistory} from './chat-history-store';
import {MockCodexConnection} from './mock-codex-connection';

type HistoryStore = {
  load(videoId: string): Promise<ChatMessage[]>;
  save(videoId: string, messages: ChatMessage[]): Promise<void>;
};

export type CodexPanelProps = {
  videoId: string;
  workspaceMode: WorkspaceMode;
  title?: string;
  connection?: CodexConnection;
  historyStore?: HistoryStore;
};

const defaultHistoryStore: HistoryStore = {
  load: loadChatHistory,
  save: saveChatHistory,
};

function connectionStatusLabel(state: CodexConnectionState): string {
  switch (state.status) {
    case 'mock-ready':
      return 'Mock';
    case 'connecting':
      return '接続中';
    case 'connected':
      return '接続済み';
    case 'disconnected':
      return `未接続: ${state.message}`;
    case 'error':
      return `エラー: ${state.message}`;
  }
}

export function CodexPanel({
  videoId,
  workspaceMode,
  title,
  connection,
  historyStore = defaultHistoryStore,
}: CodexPanelProps): JSX.Element {
  const codexConnection = useMemo(() => connection ?? new MockCodexConnection(), [connection]);
  const [connectionState, setConnectionState] = useState<CodexConnectionState>({status: 'connecting'});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const [state, history] = await Promise.all([codexConnection.connect(), historyStore.load(videoId)]);
        if (!active) {
          return;
        }
        setConnectionState(state);
        setMessages(history);
      } catch (caught) {
        if (!active) {
          return;
        }
        setConnectionState({
          status: 'error',
          message: caught instanceof Error ? caught.message : 'Codex panel initialization failed.',
        });
      }
    }

    initialize();

    return () => {
      active = false;
      codexConnection.disconnect().catch(() => undefined);
    };
  }, [codexConnection, historyStore, videoId]);

  async function persist(nextMessages: ChatMessage[]) {
    try {
      await historyStore.save(videoId, nextMessages);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'チャット履歴の保存に失敗しました。');
    }
  }

  async function sendMessage() {
    const message = validateUserMessage(input);
    if (!message || sending) {
      return;
    }

    const userMessage = createChatMessage('user', message);
    const withUserMessage = appendChatMessage(messages, userMessage);
    setMessages(withUserMessage);
    setInput('');
    setSending(true);
    await persist(withUserMessage);

    try {
      const assistantMessage = await codexConnection.sendMessage({
        videoId,
        message,
        context: {
          workspaceMode,
          title,
        },
      });
      const nextMessages = appendChatMessage(withUserMessage, assistantMessage);
      setMessages(nextMessages);
      await persist(nextMessages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Codexへの送信に失敗しました。');
    } finally {
      setSending(false);
    }
  }

  return (
    <aside className="codex-panel" data-testid="codex-panel">
      <header className="codex-panel-header">
        <div>
          <h2>Codex</h2>
          <p>企画相談</p>
        </div>
        <span className="codex-status" data-testid="codex-connection-status">
          {connectionStatusLabel(connectionState)}
        </span>
      </header>

      {error ? (
        <div className="error-banner compact" data-testid="codex-chat-error">
          <strong>{error}</strong>
        </div>
      ) : null}

      <div className="codex-message-list" data-testid="codex-message-list">
        {messages.length === 0 ? (
          <p className="muted">企画、構成、対象者、尺について相談できます。</p>
        ) : (
          messages.map((message) => <CodexMessageItem key={message.id} message={message} />)
        )}
      </div>

      <form
        className="codex-input-form"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <textarea
          data-testid="codex-chat-input"
          disabled={connectionState.status === 'connecting'}
          onChange={(event) => setInput(event.target.value)}
          placeholder="例: Kubernetes初心者向けにPod復活の動画構成を考えたい"
          rows={4}
          value={input}
        />
        <button
          data-testid="codex-chat-send-button"
          disabled={sending || !validateUserMessage(input)}
          type="submit"
        >
          {sending ? '送信中' : '送信'}
        </button>
      </form>
    </aside>
  );
}

function CodexMessageItem({message}: {message: ChatMessage}): JSX.Element {
  const testId = `codex-message-${message.role}`;

  return (
    <article className={`codex-message ${message.role}`} data-testid={testId}>
      <strong>{message.role === 'user' ? 'You' : 'Codex'}</strong>
      <p>{message.content}</p>
    </article>
  );
}

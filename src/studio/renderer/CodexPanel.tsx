import {useEffect, useMemo, useState} from 'react';
import {
  appendChatMessage,
  createChatMessage,
  validateUserMessage,
  type ChatHistory,
  type ChatMessage,
  type CodexConnection,
  type CodexConnectionState,
} from '../shared/chat';
import {extractProposals, type Proposal} from '../shared/proposal';
import type {WorkspaceMode} from '../shared/workspace';
import {MockCodexConnection} from './mock-codex-connection';

export type CodexPanelProps = {
  videoId: string;
  workspaceMode: WorkspaceMode;
  history: ChatHistory;
  onHistoryChange(history: ChatHistory): Promise<void>;
  onApproveProposal(proposalId: string): void;
  onRejectProposal(proposalId: string): void;
  onRetryProposal(proposalId: string): void;
  busyProposalIds?: ReadonlySet<string>;
  title?: string;
  connection?: CodexConnection;
  proposalError?: string | null;
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
  history,
  onHistoryChange,
  onApproveProposal,
  onRejectProposal,
  onRetryProposal,
  busyProposalIds = new Set(),
  title,
  connection,
  proposalError,
}: CodexPanelProps): JSX.Element {
  const codexConnection = useMemo(() => connection ?? new MockCodexConnection(), [connection]);
  const [connectionState, setConnectionState] = useState<CodexConnectionState>({status: 'connecting'});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    codexConnection.connect()
      .then((state) => {
        if (active) {
          setConnectionState(state);
        }
      })
      .catch((caught) => {
        if (active) {
          setConnectionState({
            status: 'error',
            message: caught instanceof Error ? caught.message : 'Codex panel initialization failed.',
          });
        }
      });

    return () => {
      active = false;
      codexConnection.disconnect().catch(() => undefined);
    };
  }, [codexConnection]);

  async function persist(nextHistory: ChatHistory) {
    try {
      await onHistoryChange(nextHistory);
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
    const withUserMessage = appendChatMessage(history.messages, userMessage);
    setInput('');
    setSending(true);
    await persist({...history, messages: withUserMessage});

    try {
      const assistantMessage = await codexConnection.sendMessage({
        videoId,
        message,
        context: {workspaceMode, title},
      });
      const extraction = extractProposals(
        assistantMessage.id,
        videoId,
        assistantMessage.content,
        assistantMessage.structuredProposals,
      );
      const nextHistory = {
        messages: appendChatMessage(withUserMessage, assistantMessage),
        proposals: [...history.proposals, ...extraction.proposals],
      };
      await persist(nextHistory);
      if (extraction.oversized) {
        setError('Codex返答が1 MBを超えたため、提案抽出をスキップしました。');
      }
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

      {error || proposalError ? (
        <div className="error-banner compact" data-testid="codex-chat-error">
          <strong>{proposalError ?? error}</strong>
        </div>
      ) : null}

      <div className="codex-message-list" data-testid="codex-message-list">
        {history.messages.length === 0 ? (
          <p className="muted">企画、構成、対象者、尺について相談できます。</p>
        ) : (
          history.messages.map((message) => (
            <CodexMessageItem
              busyProposalIds={busyProposalIds}
              key={message.id}
              message={message}
              onApprove={onApproveProposal}
              onReject={onRejectProposal}
              onRetry={onRetryProposal}
              proposals={history.proposals.filter((proposal) => proposal.messageId === message.id)}
            />
          ))
        )}
      </div>

      <form
        className="codex-input-form"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
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

function CodexMessageItem({
  message,
  proposals,
  busyProposalIds,
  onApprove,
  onReject,
  onRetry,
}: {
  message: ChatMessage;
  proposals: Proposal[];
  busyProposalIds: ReadonlySet<string>;
  onApprove(proposalId: string): void;
  onReject(proposalId: string): void;
  onRetry(proposalId: string): void;
}): JSX.Element {
  return (
    <article className={`codex-message ${message.role}`} data-testid={`codex-message-${message.role}`}>
      <strong>{message.role === 'user' ? 'You' : 'Codex'}</strong>
      <p>{message.content}</p>
      {proposals.map((proposal) => (
        <ProposalCard
          busy={busyProposalIds.has(proposal.id)}
          key={proposal.id}
          onApprove={onApprove}
          onReject={onReject}
          onRetry={onRetry}
          proposal={proposal}
        />
      ))}
    </article>
  );
}

function ProposalCard({
  proposal,
  busy,
  onApprove,
  onReject,
  onRetry,
}: {
  proposal: Proposal;
  busy: boolean;
  onApprove(proposalId: string): void;
  onReject(proposalId: string): void;
  onRetry(proposalId: string): void;
}): JSX.Element {
  return (
    <section
      aria-busy={busy}
      className={`proposal-card ${proposal.status}`}
      data-testid={`proposal-${proposal.kind}-card`}
    >
      <strong>{proposal.kind === 'json-draft' ? 'JSON下書き提案' : `コマンド提案: ${proposal.operation}`}</strong>
      <span data-testid={`proposal-${proposal.kind}-status`}>{busy ? '保存中' : proposal.status}</span>
      {proposal.error ? <p>{proposal.error}</p> : null}
      {proposal.status === 'pending' ? (
        <div className="proposal-actions">
          <button
            data-testid={`proposal-${proposal.kind}-reject`}
            disabled={busy}
            onClick={() => onReject(proposal.id)}
            type="button"
          >
            Reject
          </button>
          <button
            data-testid={`proposal-${proposal.kind}-approve`}
            disabled={busy}
            onClick={() => onApprove(proposal.id)}
            type="button"
          >
            Approve
          </button>
        </div>
      ) : null}
      {proposal.status === 'failed' ? (
        <button
          data-testid={`proposal-${proposal.kind}-retry`}
          disabled={busy}
          onClick={() => onRetry(proposal.id)}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </section>
  );
}

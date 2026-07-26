import '@testing-library/jest-dom/vitest';
import {useState} from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CodexPanel} from '../../src/studio/renderer/CodexPanel';
import {
  createChatMessage,
  type ChatHistory,
  type ChatMessage,
  type CodexConnection,
  type CodexConnectionState,
  type CodexUserInput,
} from '../../src/studio/shared/chat';
import {createMinimalScript} from '../../src/studio/shared/script-draft';
import {extractProposals, transitionProposal} from '../../src/studio/shared/proposal';

function createConnection(response?: ChatMessage): CodexConnection & {sendMessage: ReturnType<typeof vi.fn>} {
  return {
    connect: vi.fn<() => Promise<CodexConnectionState>>().mockResolvedValue({status: 'mock-ready'}),
    sendMessage: vi.fn<(input: CodexUserInput) => Promise<ChatMessage>>().mockImplementation(async (input) =>
      response ?? createChatMessage('assistant', `Mock: ${input.message}`),
    ),
    disconnect: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  };
}

function PanelHarness({
  initialHistory = {messages: [], proposals: []},
  connection = createConnection(),
  onApprove = vi.fn(),
  onReject = vi.fn(),
  onRetry = vi.fn(),
  busyProposalIds,
}: {
  initialHistory?: ChatHistory;
  connection?: CodexConnection;
  onApprove?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  onRetry?: (proposalId: string) => void;
  busyProposalIds?: ReadonlySet<string>;
}) {
  const [history, setHistory] = useState(initialHistory);
  return (
    <CodexPanel
      busyProposalIds={busyProposalIds}
      connection={connection}
      history={history}
      onApproveProposal={onApprove}
      onHistoryChange={async (next) => setHistory(next)}
      onRejectProposal={onReject}
      onRetryProposal={onRetry}
      title="Sample"
      videoId="sample-video"
      workspaceMode="existing-script"
    />
  );
}

describe('CodexPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows explicit Mock status', async () => {
    render(<PanelHarness />);
    expect(await screen.findByTestId('codex-connection-status')).toHaveTextContent('Mock');
  });

  it('submits user message and renders assistant response', async () => {
    const connection = createConnection();
    render(<PanelHarness connection={connection} />);

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
      context: {workspaceMode: 'existing-script', title: 'Sample'},
    });
  });

  it('does not send an empty message', async () => {
    const connection = createConnection();
    render(<PanelHarness connection={connection} />);

    await screen.findByTestId('codex-connection-status');
    fireEvent.change(screen.getByTestId('codex-chat-input'), {target: {value: '   '}});
    fireEvent.click(screen.getByTestId('codex-chat-send-button'));

    await waitFor(() => expect(connection.sendMessage).not.toHaveBeenCalled());
  });

  it('renders a proposal and forwards approve and reject actions', async () => {
    const message = createChatMessage('assistant', 'JSONを提案します', {
      id: 'assistant-1',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    const proposal = extractProposals(
      message.id,
      'sample-video',
      '',
      [{kind: 'json-draft', script: createMinimalScript('sample-video')}],
      '2026-07-25T00:00:00.000Z',
    ).proposals[0];
    const onApprove = vi.fn();
    const onReject = vi.fn();

    render(
      <PanelHarness
        initialHistory={{messages: [message], proposals: [proposal]}}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    await screen.findByText('Mock');
    fireEvent.click(screen.getByTestId('proposal-json-draft-approve'));
    fireEvent.click(screen.getByTestId('proposal-json-draft-reject'));
    expect(onApprove).toHaveBeenCalledWith(proposal.id);
    expect(onReject).toHaveBeenCalledWith(proposal.id);
  });

  it('disables proposal actions while saving and exposes retry for failures', async () => {
    const message = createChatMessage('assistant', 'Validateします', {
      id: 'assistant-1',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    const pending = extractProposals(
      message.id,
      'sample-video',
      '',
      [{kind: 'command', operation: 'validate'}],
      '2026-07-25T00:00:00.000Z',
    ).proposals[0];
    const failed = transitionProposal(
      transitionProposal(pending, 'approved'),
      'failed',
      {error: 'Command Runner未接続'},
    );
    const onRetry = vi.fn();

    const {unmount} = render(
      <PanelHarness
        busyProposalIds={new Set([pending.id])}
        initialHistory={{messages: [message], proposals: [pending]}}
      />,
    );
    await screen.findByText('Mock');
    expect(screen.getByTestId('proposal-command-approve')).toBeDisabled();
    unmount();

    render(
      <PanelHarness
        initialHistory={{messages: [message], proposals: [failed]}}
        onRetry={onRetry}
      />,
    );
    await screen.findByText('Mock');
    fireEvent.click(screen.getByTestId('proposal-command-retry'));
    expect(onRetry).toHaveBeenCalledWith(failed.id);
  });
});

// @vitest-environment jsdom
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {CodexPanel} from '../../src/studio/renderer/CodexPanel';
import {RealCodexConnection} from '../../src/studio/renderer/real-codex-connection';
import type {CodexApi, CodexEvent} from '../../src/studio/shared/codex-app-server';

describe('CodexPanel real mode', () => {
  it('renders streamed text and settles a dedicated approval card', async () => {
    let emit: (event: CodexEvent) => void = () => undefined;
    const api: CodexApi = {
      connect: vi.fn().mockResolvedValue({status: 'connected'}),
      send: vi.fn().mockResolvedValue(undefined),
      interrupt: vi.fn().mockResolvedValue(undefined),
      reconnect: vi.fn().mockResolvedValue({status: 'connected'}),
      startNewThread: vi.fn().mockResolvedValue(undefined),
      respondApproval: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      onEvent(listener) {
        emit = listener;
        return () => {
          emit = () => undefined;
        };
      },
    };
    render(
      <CodexPanel
        connection={new RealCodexConnection(api)}
        history={{messages: [], proposals: []}}
        onApproveProposal={() => undefined}
        onHistoryChange={vi.fn().mockResolvedValue(undefined)}
        onRejectProposal={() => undefined}
        onRetryProposal={() => undefined}
        videoId="demo"
        workspaceMode="empty-draft"
      />,
    );
    await waitFor(() => expect(api.connect).toHaveBeenCalledWith('demo'));
    act(() => {
      emit({type: 'delta', text: 'stream'});
      emit({
        type: 'approval',
        approval: {id: '9', method: 'item/requestApproval', summary: 'safe write', status: 'pending'},
      });
    });
    expect((await screen.findByTestId('codex-server-approval-card')).textContent).toContain('safe write');
    fireEvent.click(screen.getByTestId('codex-server-approval-deny'));
    expect(api.respondApproval).toHaveBeenCalledWith('9', false);
    expect((await screen.findByTestId('codex-streaming-message')).textContent).toContain('stream');
  });
});

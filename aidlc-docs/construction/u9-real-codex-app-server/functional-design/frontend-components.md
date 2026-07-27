# Frontend Components: U9 Real Codex App Server Integration

## CodexPanel

### Props

- videoId、workspaceMode、history、history persistence callbacks。
- Real/Mock connection factory。
- Existing proposal actions。

### State

- connection mode and state。
- active turn status。
- bounded partial assistant items。
- command/file-change progress。
- pending App Server approvals。
- safe error and resume recovery action。

### Interactions

- Real/Mock selector clearly labels source。
- Send disabled while connecting or active turn。
- Manual reconnect shown after terminal connection failure。
- Resume failure shows `新しいthreadを開始` action。
- Partial failed item is marked `未完了`。

## StreamingAssistantItem

- Uses stable item ID as key。
- Renders bounded delta text and status。
- On completed event, emits one persistence request。
- On failed/interrupted terminal, remains transient and is not persisted。

## PendingCodexApprovalCard

- Reuses existing proposal card visual language, not its state schema。
- Displays safe operation category and bounded summary。
- Provides approve and deny buttons with stable `data-testid` values。
- Disables both buttons after first decision。
- Shows denied/expired terminal state。

## ConnectionRecoveryPanel

- Differentiates install、auth、resume、protocol、process failures。
- Exposes reconnect for recoverable connection errors。
- Exposes start-new-thread only for resume failure。
- Does not auto-select Mock。

## Workspace Switch Integration

- Workspace selection enters `switching` while active turn is interrupted。
- Old Workspace events are removed before new Workspace state renders。
- Existing non-Codex production UI remains usable during Codex error。

## Local File Client Migration

- Workspace、script、asset、chat history clients keep domain-oriented functions。
- Implementations delegate to Context Bridge instead of `window.require`。
- Unavailable bridge returns actionable typed error; it never falls back to direct Node access。

## Accessibility and Automation

- Connection、turn、approval states use text, not color alone。
- Streaming region uses an appropriate live status without re-announcing every token。
- Interactive controls have stable `data-testid` names。
- Keyboard focus moves to new blocking approval only when it does not interrupt active text entry。

## PBT Applicability

- React rendering itself: No PBT properties identified; behavior uses example-based component tests。
- Pure event-to-view reducer: Stateful/invariant PBT applies if implemented separately。
- Client event validation: Bounds invariant PBT applies。

# Domain Entities: U9 Real Codex App Server Integration

## CodexConnection

- **Identity**: Application singleton。
- **State**: `idle | starting | initializing | ready | reconnecting | disconnecting | failed`。
- **Fields**: process generation、active videoId、active thread ID、connection error code。
- **Invariant**: `ready`だけがturnを開始できる。1 generationにつきinitializeは高々1回。

## WorkspaceCodexSession

- **Identity**: videoId。
- **Fields**: threadId、updatedAt、optional Codex version metadata。
- **Persistence**: `generated/studio/{videoId}/codex-session.json`。
- **Invariant**: Validated videoIdとbounded threadIdだけを保持し、credentialやpromptは保持しない。

## CodexTurn

- **Identity**: turnId。
- **State**: `starting | running | completed | failed | interrupted`。
- **Relationships**: 1 connectionは高々1 active turn。1 turnは0以上のAssistantItemsとPendingApprovalsを持つ。
- **Invariant**: Terminal stateから遷移しない。

## AssistantItem

- **Identity**: itemId。
- **State**: `streaming | completed | abandoned`。
- **Fields**: bounded partial text、sequence、createdAt。
- **Persistence**: completed itemだけを別々のChatMessageとして順序保存する。
- **Invariant**: failed/interrupted turnのstreaming itemはcanonical historyへ保存しない。

## PendingCodexApproval

- **Identity**: approvalId。
- **State**: `pending | approved | denied | expired`。
- **Fields**: safe display summary、operation category、createdAt、deadline。
- **Invariant**: 1 IDは高々1回terminalになり、unknown/duplicate decisionは無効。

## ProtocolRequest

- **Identity**: bounded stringまたはnumber request ID。
- **State**: `pending | resolved | rejected | timed-out`。
- **Invariant**: Response arrival orderに関係なくmatching IDだけがsettleされる。

## StreamingViewState

- **Fields**: connection state、turn state、partial items、progress items、pending approvals、safe error。
- **Persistence**: Renderer memory only。Terminal assistant itemsだけChatHistoryへ渡す。

## Testable Properties

| Component | Category | Property |
|---|---|---|
| Protocol Codec | Round-trip | Valid client messageをserializeしてparse-compatible JSONへ戻すとsemantic valueが等しい |
| Protocol Codec | Invariant | Line byte limit外、invalid ID、invalid shapeは常にrejected |
| Request Correlator | Invariant | Arbitrary response orderingでもmatching requestだけがexactly once settle |
| Approval Controller | Stateful | Arbitrary decision sequenceでも1 IDのterminal responseは高々1つ |
| Turn State | Stateful | Terminal stateからnon-terminal stateへ戻らない |
| Session Parser | Invariant | Outputはvalid bounded sessionまたはnull |
| Assistant Items | Invariant | Completed itemsの保存順序はcompletion event sequenceと等しい |

PBT-01準拠。各propertyはCode Generation planへtraceする。

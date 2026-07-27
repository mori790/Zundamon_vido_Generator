# Domain Entities: U4 Codex提案と承認フロー

## Proposal

- `id: string`
- `messageId: string`
- `videoId: string`
- `kind: "json-draft" | "command"`
- `status: ProposalStatus`
- `createdAt: string`
- `updatedAt: string`
- `error?: string`

Codexメッセージに関連付く、ユーザー承認前の操作候補を表す。

## ProposalStatus

- `pending`
- `approved`
- `rejected`
- `completed`
- `failed`

`pending`だけが操作可能で、`rejected`、`completed`、`failed`は終端状態とする。

## JsonDraftProposal

`Proposal`に次を加える。

- `kind: "json-draft"`
- `source: "structured-event" | "markdown-json-block"`
- `script: VideoScript`

Approve後はU3の`createDraftFromScript`へ渡される。正式保存は所有しない。

## CommandProposal

`Proposal`に次を加える。

- `kind: "command"`
- `operation: "validate" | "voice" | "timeline" | "preview" | "render"`

任意コマンド文字列は保持せず、許可されたoperationだけを表す。実行はU6 Command Runnerが所有する。

## ProposalCollection

- `videoId: string`
- `proposals: Proposal[]`

チャットセッションと同じvideo ID単位で提案を保持する。

## ProposalDispatchResult

- 成功: `{status: "completed"; proposal: Proposal}`
- 失敗: `{status: "failed"; proposal: Proposal; message: string}`
- 置換確認待ち: `{status: "confirmation-required"; proposal: JsonDraftProposal}`

## 関係

- `ChatMessage`は0件以上の`Proposal`を参照する。
- `JsonDraftProposal`はApprove後に1つのU3 `ScriptDraft`を作る。
- `CommandProposal`はApprove後にU6の1 operationへ対応する。
- `ProposalCollection`は`ChatSession.videoId`と同じ境界で保存する。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。

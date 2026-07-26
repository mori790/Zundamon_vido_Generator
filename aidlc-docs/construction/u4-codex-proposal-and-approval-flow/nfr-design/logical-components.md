# Logical Components: U4 Codex提案と承認フロー

## Proposal Extractor

- **配置候補**: `src/studio/shared/proposal.ts`
- **責務**:
  - 構造化proposal eventを優先して提案へ変換する。
  - eventがない場合だけMarkdown JSON blockを抽出する。
  - 1 MB上限を適用する。
  - `videoScriptSchema`適合済みのJSON提案だけを返す。
- **特性**: 純粋関数。React、filesystem、U3、U6へ依存しない。

## Proposal State Reducer

- **配置候補**: `src/studio/shared/proposal.ts`
- **責務**:
  - `pending`から許可された状態遷移を計算する。
  - 終端状態の再操作を拒否する。
  - proposal ID単位の更新結果を返す。
- **特性**: 純粋関数。単体テスト可能。

## Proposal Validator

- **配置候補**: `src/studio/shared/proposal.ts`
- **責務**:
  - 永続化されたproposalの共通フィールドとdiscriminated payloadを検証する。
  - JSON提案を`videoScriptSchema`で検証する。
  - コマンド提案をoperation allowlistで検証する。
  - Approve直前の再検証を提供する。

## Chat History Envelope

- **配置候補**: `src/studio/shared/chat.ts`
- **構造**:
  - `messages: ChatMessage[]`
  - `proposals: Proposal[]`
- **責務**:
  - 新形式の型を定義する。
  - 旧ChatMessage配列を空proposals付きenvelopeへ変換する。

## History Compactor

- **配置候補**: `src/studio/shared/chat.ts`
- **責務**:
  - 10 MB超過時に古い終端提案と関連メッセージを決定的に削除する。
  - `pending`、`approved`と関連メッセージを維持する。
  - 縮小不能時に明確な失敗を返す。
- **特性**: 純粋関数。実ファイルを書き換えない。

## Chat History Store

- **配置候補**: `src/studio/renderer/chat-history-store.ts`
- **責務**:
  - envelopeをchat-history.jsonへ保存する。
  - 新形式と旧配列形式を読み込む。
  - Proposal Validatorで不正提案を除外する。
  - History Compactorを保存前に呼ぶ。
- **依存**: 既存の注入可能なFileSystemAccess。

## Proposal Coordinator

- **配置候補**: `src/studio/renderer/StudioApp.tsx`
- **責務**:
  - video ID単位のProposal collectionと操作中IDを所有する。
  - 保存先行のApprove、Reject、Retryを調整する。
  - JSON提案をU3下書きへdispatchする。
  - コマンド提案をU6 operation callbackへdispatchする。
  - 既存下書きがある場合の置換確認状態を所有する。
- **制約**: 抽出、状態遷移、payload validationを実装しない。

## Proposal Presentation

- **配置候補**: `src/studio/renderer/CodexPanel.tsx`
- **責務**:
  - メッセージに関連するProposalCardを表示する。
  - 状態、エラー、Retry、Approve、Rejectを表示する。
  - props callbackへユーザー操作を通知する。
- **制約**: Proposal collectionを所有せず、filesystemまたはdispatch先へ直接アクセスしない。

## U3 Draft Dispatch Adapter

- **接続先**: `createDraftFromScript`とScriptReviewPanel。
- **責務**:
  - 再validation済み`VideoScript`をU3下書きへ変換する。
  - 既存下書き置換確認後だけ更新する。
  - 正式JSON保存は行わない。

## U6 Command Dispatch Adapter

- **接続先**: U6 Command Runner。
- **責務**:
  - allowlist済みoperationを渡す。
  - U6未接続を`failed`結果へ変換する。
  - 任意コマンド文字列を受け取らない。

## Test Seams

- Proposal Extractor: event、Markdown、1 MB境界を直接入力する。
- Proposal State Reducer: 全状態遷移と二重操作を直接入力する。
- History Compactor: serialized sizeと関連関係を固定入力する。
- Chat History Store: メモリFileSystemAccessで新旧形式と失敗を検証する。
- Proposal Coordinator: mock history store、U3 callback、U6 callbackを注入する。
- Proposal Presentation: propsだけで表示と操作を検証する。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

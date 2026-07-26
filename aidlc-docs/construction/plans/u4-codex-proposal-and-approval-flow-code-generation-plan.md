# Code Generation Plan: U4 Codex提案と承認フロー

## ユニットの前提

- **Unit**: U4 Codex Proposal and Approval Flow
- **Primary Stories**: US-5、US-7、US-18
- **Dependencies**: U2 Codex App Server Connection、U3 JSON Draft Review and Scene Editing
- **実装方針**: 既存TypeScript、React、Zod、Vitestだけを使い、新規依存関係を追加しない。
- **Infrastructure Design**: ローカルGUI内の変更であり、新規インフラがないためスキップ。

## 並行作業への注意

- U6は別タブの並行作業として扱う。
- U4はU6の実装ファイルを変更しない。
- コマンド提案は定義済みoperation型だけを持ち、U6未接続時は`failed`にする。
- U6接続はoptional callback境界だけを用意し、実行基盤を先行実装しない。

## 対象コード

### 作成

- `src/studio/shared/proposal.ts`
- `tests/studio/proposal.test.ts`

### 変更

- `src/studio/shared/chat.ts`
- `src/studio/renderer/chat-history-store.ts`
- `src/studio/renderer/CodexPanel.tsx`
- `src/studio/renderer/ScriptReviewPanel.tsx`
- `src/studio/renderer/StudioApp.tsx`
- `src/studio/renderer/styles.css`
- `tests/studio/chat.test.ts`
- `tests/studio/CodexPanel.test.tsx`
- `tests/studio/ScriptReviewPanel.test.tsx`
- `tests/studio/StudioApp.test.tsx`

### Documentation

- `aidlc-docs/construction/u4-codex-proposal-and-approval-flow/code/summary.md`

## 実装手順

### Step 1: Proposalモデルと抽出

- [x] `src/studio/shared/proposal.ts`を作成する。
- [x] JSON提案とコマンド提案のdiscriminated unionを定義する。
- [x] ProposalStatusと許可された状態遷移を実装する。
- [x] 1 MB上限、構造化event優先、Markdown JSON fallbackを実装する。
- [x] `videoScriptSchema`とoperation allowlistによる検証を実装する。
- [x] proposal ID単位の二重操作ガードに必要な純粋関数を実装する。

### Step 2: Chat History Envelope

- [x] `src/studio/shared/chat.ts`へmessagesとproposalsを持つenvelope型を追加する。
- [x] 旧ChatMessage配列を新envelopeへ変換する後方互換処理を追加する。
- [x] 10 MB超過時に古い終端提案と関連メッセージを削減する純粋関数を追加する。
- [x] pendingまたはapproved提案と関連メッセージを削除しない。

### Step 3: Chat History Store

- [x] `src/studio/renderer/chat-history-store.ts`を新envelopeのload/saveへ更新する。
- [x] 読み込み時に不正proposalを除外する。
- [x] 保存前に履歴サイズ削減を適用する。
- [x] 既存video ID path sanitizationとFileSystemAccess注入を維持する。

### Step 4: Proposal Coordinator

- [x] `src/studio/renderer/StudioApp.tsx`でvideo ID単位のproposal stateを所有する。
- [x] 保存先行のApprove、Reject、Retryフローを接続する。
- [x] 操作中proposal IDの二重操作を防止する。
- [x] JSON提案をScriptReviewPanelへ渡す。
- [x] コマンド提案はoptional U6 callbackへ渡し、未接続時は`failed`にする。

### Step 5: CodexPanel提案UI

- [x] `src/studio/renderer/CodexPanel.tsx`でCodex返答から提案を抽出する。
- [x] ProposalCardへ状態、Approve、Reject、Retryを表示する。
- [x] Proposal stateはpropsで受け取り、CodexPanel内部で所有しない。
- [x] 保存中の操作無効化、`aria-busy`、安定した`data-testid`を追加する。
- [x] 通常チャット送受信とMock表示を維持する。

### Step 6: U3下書き受け渡し

- [x] `src/studio/renderer/ScriptReviewPanel.tsx`へ承認済みJSON提案の受け入れ境界を追加する。
- [x] 未適用下書きがある場合に置換確認を表示する。
- [x] Cancelでは既存下書きとpending提案を維持する。
- [x] Confirmでは`createDraftFromScript`を再利用して下書きを置換する。
- [x] 提案読み込み後にApplyまたは編集継続を選べる表示を追加し、自動保存しない。

### Step 7: スタイル

- [x] `src/studio/renderer/styles.css`へProposalCard、状態、確認UI、Retryの最小スタイルを追加する。
- [x] 既存U2 CodexPanel、U3 ScriptReviewPanel、U6並行追加スタイルを壊さない。
- [x] キーボードフォーカスを視認可能にする。

### Step 8: Proposal単体テスト

- [x] `tests/studio/proposal.test.ts`を作成する。
- [x] 構造化event優先、Markdown fallback、schema不適合、1 MB境界をテストする。
- [x] 状態遷移、終端状態、二重操作防止をテストする。
- [x] operation allowlistをテストする。

### Step 9: 履歴保存テスト

- [x] `tests/studio/chat.test.ts`を更新する。
- [x] 新envelopeの保存・復元をテストする。
- [x] 旧ChatMessage配列の読み込みをテストする。
- [x] 不正proposal除外と10 MB削減をテストする。
- [x] 保存失敗時に操作を確定しない境界をテストする。

### Step 10: コンポーネント・統合テスト

- [x] `tests/studio/CodexPanel.test.tsx`で提案表示、Approve、Reject、Retry、操作中無効化をテストする。
- [x] `tests/studio/ScriptReviewPanel.test.tsx`で提案読込、既存下書き置換確認、自動保存しないことをテストする。
- [x] `tests/studio/StudioApp.test.tsx`でJSON提案からU3下書きへの連携をテストする。
- [x] U6未接続コマンド提案が`failed`になることをテストする。
- [x] 既存U1、U2、U3テスト期待値を維持する。

### Step 11: Code Summary

- [x] `aidlc-docs/construction/u4-codex-proposal-and-approval-flow/code/summary.md`を作成する。
- [x] 作成・変更ファイルとUS-5、US-7、US-18の対応をまとめる。
- [x] Extension Rule Complianceを記録する。

### Step 12: Verification

- [x] `npx tsc --noEmit`を実行する。
- [x] `npm test`を実行する。
- [x] `npm run studio:build`を実行する。
- [x] `npm run studio:dev -- --host 127.0.0.1`を短時間起動確認する。

### Step 13: Electron起動レビュー修正

- [x] Node.js 20と互換性のあるElectron 37.10.3を固定する。
- [x] lockfileとElectron binaryを再インストールする。
- [x] `npm run studio:start`でElectron起動を確認する。

### Step 14: Electron TypeScript entrypoint修正

- [x] `tsx` loaderをElectron CLI引数ではなく`NODE_OPTIONS`へ渡す。
- [x] `npm run studio:start`で`main.ts`がapp entrypointとして読み込まれることを確認する。

### Step 15: Renderer-safe schema configuration

- [x] browser-safeな環境既定値を`src/core/env.ts`へ分離する。
- [x] schemaがNode専用`core/config.ts`をimportしないようにする。
- [x] TypeScript、tests、Studio build、Electron起動を再検証する。

## Story Traceability

- **US-5**: Codex返答から有効なJSON提案を検出し、レビュー可能なU3下書きへ渡す。
- **US-7**: 新しい提案を既存下書きと置換確認したうえで再編集できる。
- **US-18**: JSONまたはコマンド提案は明示的なApproveなしにdispatchされない。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

## 承認ゲート

この計画をU4 Code Generationの単一の実行基準とする。承認後、Step 1から順に実装し、各完了と同じinteractionでチェックボックスを更新する。

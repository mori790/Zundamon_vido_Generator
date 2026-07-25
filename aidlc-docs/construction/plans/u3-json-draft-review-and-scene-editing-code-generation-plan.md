# Code Generation Plan: U3 JSON下書きレビューとシーン編集

## ユニットの前提

- **Unit**: U3 JSON Draft Review and Scene Editing.
- **目的**: Studioワークスペースに、読み取り専用台本表示、下書き作成、Raw JSON編集、構造化シーン編集、バリデーション、Apply/Backup保存を追加する。
- **Primary Stories**: US-6, US-8, US-9.
- **Dependencies**: U1 Electron App Shell and Workspace Foundation.
- **Related Completed Work**: U2 Codex mock panel. U3はCodex提案抽出を実装しない。
- **Out of Scope**: 実Codex proposal連携、画像ファイル選択、コマンド実行、Preview、Render。

## 並行作業への注意

ユーザーはU6/U7を別タブで同時並行実装予定。U3では以下を最小限の変更に抑える。

- `src/studio/renderer/StudioApp.tsx`: `workspace-placeholder`を`ScriptReviewPanel`へ差し替える変更のみ。
- `src/studio/renderer/styles.css`: U3用クラス追加のみ。既存U2 Codexスタイルは変更しない。
- `src/studio/shared/*`: U3専用ファイルを追加し、既存共有型の破壊的変更は避ける。
- `aidlc-docs/audit.md`と`aidlc-docs/aidlc-state.md`: AIDLCログ更新のみ。

## 対象コード

Application code:

- `src/studio/shared/script-draft.ts`
- `src/studio/shared/script-apply.ts`
- `src/studio/renderer/script-file-access.ts`
- `src/studio/renderer/ScriptReviewPanel.tsx`
- `src/studio/renderer/StudioApp.tsx`
- `src/studio/renderer/styles.css`
- `tests/studio/script-draft.test.ts`
- `tests/studio/script-apply.test.ts`
- `tests/studio/ScriptReviewPanel.test.tsx`
- `tests/studio/StudioApp.test.tsx`

Documentation summary:

- `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/code/summary.md`

## 実装手順

### Step 1: 下書き状態ロジック

- [x] `src/studio/shared/script-draft.ts`を作成する。
- [x] DraftStatus、DraftValidationIssue、ScriptDraft、DraftViewModeを定義する。
- [x] active scriptから下書きを作成する関数を実装する。
- [x] 空ワークスペース用の最小下書きを作成する関数を実装する。
- [x] Raw JSON更新とschema validationを実装する。
- [x] 構造化scene編集、追加、削除、上下移動を実装する。
- [x] sequential scene ID生成を実装する。

### Step 2: Apply/Backup保存ロジック

- [x] `src/studio/shared/script-apply.ts`を作成する。
- [x] FileAccess interfaceを定義する。
- [x] `scriptPathFor(videoId)`と`backupPathFor(videoId)`を実装する。
- [x] 最終validation、既存JSON読み込み、`.bak`保存、正式JSON保存の順序を実装する。
- [x] backup失敗とsave失敗を区別したApplyResultを返す。

### Step 3: Renderer FileAccess

- [x] `src/studio/renderer/script-file-access.ts`を作成する。
- [x] `window.require('node:fs/promises')`からFileAccessを作る。
- [x] `readFile`と`writeFile`を提供する。
- [x] renderer外では明確なエラーを返す。

### Step 4: ScriptReviewPanel UI

- [x] `src/studio/renderer/ScriptReviewPanel.tsx`を作成する。
- [x] 読み取り専用active script表示を実装する。
- [x] Create Draft、Apply、Discardを実装する。
- [x] Raw JSONタブとScenesタブを実装する。
- [x] textarea Raw JSON editorを実装する。
- [x] 構造化scene editorを実装する。
- [x] Raw JSON無効時の注意バナーとvalidation issue表示を実装する。
- [x] 安定した`data-testid`を追加する。

### Step 5: Workspace統合

- [x] `src/studio/renderer/StudioApp.tsx`を更新する。
- [x] `workspace-placeholder`を`ScriptReviewPanel`に置き換える。
- [x] Apply成功後にworkspace activeScriptを更新できる状態更新を追加する。
- [x] U1 start screenとU2 CodexPanelの動作を維持する。

### Step 6: スタイル

- [x] `src/studio/renderer/styles.css`を更新する。
- [x] ScriptReviewPanel、toolbar、tabs、raw editor、scene editor、issue listのスタイルを追加する。
- [x] キーボードフォーカスが見えるスタイルを追加する。
- [x] 既存CodexPanelスタイルを壊さない。

### Step 7: 下書きロジックテスト

- [x] `tests/studio/script-draft.test.ts`を作成する。
- [x] 既存scriptから下書き作成をテストする。
- [x] 空workspace用最小下書きをテストする。
- [x] invalid raw JSONでlastValidScriptが維持されることをテストする。
- [x] scene追加、削除、移動、ID生成をテストする。
- [x] 100 scene代表データをテストする。

### Step 8: Apply保存テスト

- [x] `tests/studio/script-apply.test.ts`を作成する。
- [x] backupが正式保存より先に実行されることをテストする。
- [x] backup失敗時に正式保存しないことをテストする。
- [x] save失敗時にfailed resultを返すことをテストする。
- [x] 成功時に整形済みJSONを書き込むことをテストする。

### Step 9: ScriptReviewPanelコンポーネントテスト

- [x] `tests/studio/ScriptReviewPanel.test.tsx`を作成する。
- [x] 既存台本が読み取り専用で表示されることをテストする。
- [x] Create DraftでRaw JSON編集可能になることをテストする。
- [x] Raw JSON無効時にApplyが無効化されることをテストする。
- [x] Structured scene編集がRaw JSONに反映されることをテストする。
- [x] Apply成功時の表示更新をテストする。

### Step 10: 既存StudioAppテスト更新

- [x] `tests/studio/StudioApp.test.tsx`を更新する。
- [x] workspaceを開いた時にScriptReviewPanelが表示されることを検証する。
- [x] CodexPanelが引き続き表示されることを検証する。
- [x] U1/U2の既存テスト期待値を保つ。

### Step 11: Code Summary

- [ ] `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/code/summary.md`を作成する。
- [ ] 作成/変更ファイルをまとめる。
- [ ] US-6、US-8、US-9への対応をまとめる。

### Step 12: Verification

- [ ] `npx tsc --noEmit`を実行する。
- [ ] `npm test`を実行する。
- [ ] `npm run studio:build`を実行する。
- [ ] `npm run studio:dev -- --host 127.0.0.1`を短時間起動確認する。

## Story Traceability

- **US-6**: Raw JSONとStructured scenesの切替表示、編集、validation issue表示で対応。
- **US-8**: 明示的Apply、schema validation、`.bak`作成、`input/{videoId}.json`保存で対応。
- **US-9**: scene追加、削除、移動、core field編集で対応。

## 承認ゲート

この計画をU3 Code Generationの単一の実行基準とする。コード変更は、この計画が承認されてから開始する。

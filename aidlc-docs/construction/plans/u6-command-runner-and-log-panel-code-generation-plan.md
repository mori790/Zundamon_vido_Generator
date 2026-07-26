# Code Generation Plan: U6 Command Runner and Log Panel

この計画はU6 Code Generationのsingle source of truthである。U5の進行中ファイルは各変更直前に再読し、U6以外の変更を保持する。

## Unit Context

- **Stories**: US-12、US-13、US-14、US-17。
- **Supports**: US-2、US-11、US-15、US-16、US-18、US-19、US-20。
- **Dependency**: U1 Electron App Shell and Workspace Foundation。
- **Execution target**: 保存済み `input/{videoId}.json`。
- **Existing pipeline**: `npm run validate|voice|timeline|preview|render -- {videoId}`。
- **Database entities**: なし。
- **New dependency**: なし。Node.js `child_process` と既存Electron IPCを使用する。
- **Out of scope**: ログ永続化、複数同時実行、生成途中ファイル削除、U7 preview埋め込み、U8出力検証。

## Expected Contracts

- Rendererは固定CommandTypeと検証済みvideoIdだけをmain processへ渡す。
- Main processは固定CommandCatalogからnpm scriptと引数配列を構築する。
- OperationとLogEntryは `src/studio/shared/` の型をmain、preload、rendererで共有する。
- U4の承認済みCommand Proposalと手動ボタンは同じCommand Clientを使用する。

## Implementation Plan

### Step 1: Shared command model

- [x] `src/studio/shared/command.ts` にCommandType、Operation、LogEntry、IPC request/event型を追加する。
- [x] allowlist、状態遷移、1,000行リングバッファの純粋ロジックを実装する。
- [x] `tests/studio/command.test.ts` でallowlist、状態遷移、バッファ上限を検証する。

### Step 2: Electron command runner

- [x] `src/studio/main/command-runner.ts` に固定CommandCatalogと `spawn` 実行を追加する。
- [x] Validate事前フェーズ、本コマンド、stdout/stderr/systemログ、単一実行制御を実装する。
- [x] Stop時にプロセスツリー終了を試み、10秒後の強制終了と途中ファイル警告を実装する。
- [x] 子プロセスを注入できる最小境界を設け、`tests/studio/command-runner.test.ts` で成功、失敗、競合、Stopを検証する。

### Step 3: IPC and preload boundary

- [x] 変更直前に `src/studio/main/main.ts` と `src/studio/main/preload.ts` を再読し、並列変更を保持する。
- [x] `src/studio/main/main.ts` にstart、stop、clear、snapshotのIPC handlerとイベント配信を追加する。
- [x] `src/studio/main/preload.ts` に狭いCommand APIと購読解除を追加する。

### Step 4: Renderer command client

- [x] `src/studio/renderer/command-client.ts` にpreload APIの型付きwrapperを追加する。
- [x] Electron APIがないテスト環境では明示的なunavailable結果を返す。
- [x] `tests/studio/command-client.test.ts` でAPI委譲とunavailable処理を検証する。

### Step 5: Production command UI

- [x] `src/studio/renderer/ProductionCommandPanel.tsx` に固定5操作、status、Stop、Clear Logs、最大1,000行ログ、復旧ヒントを追加する。
- [x] interactive elementへ安定した `data-testid` を付与する。
- [x] `tests/studio/ProductionCommandPanel.test.tsx` で開始、競合無効化、Stop、Clear、ログ表示を検証する。

### Step 6: Workspace and proposal integration

- [x] 変更直前に `src/studio/renderer/StudioApp.tsx` と `src/studio/renderer/styles.css` を再読し、U5の並列変更を保持する。
- [x] WorkspaceへProductionCommandPanelを追加する。
- [x] U4の承認済みCommand Proposalを同じstartCommandへ接続し、成功・失敗をproposal状態へ反映する。
- [x] 既存 `tests/studio/StudioApp.test.tsx` のU6 unavailable期待を実行成功・失敗の期待へ更新する。
- [x] U6 UIに必要な最小CSSだけを既存stylesheetへ追加する。

### Step 7: Documentation and traceability

- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/code/summary.md` に変更ファイル、契約、既知の制限を記録する。
- [x] US-12、US-13、US-14、US-17の実装対応をsummaryへ記録する。
- [x] Security、Resiliency、Property-Based Testing拡張が無効であることを記録する。

### Step 8: Verification

- [x] `npx tsc --noEmit` を実行する。
- [x] U6の対象テストを実行する。
- [x] 全テストを実行する。
- [x] `npm run studio:build` を実行する。
- [x] 失敗があればU6範囲で修正し、再検証する。
- [x] 重複ファイルとU5成果物への意図しない変更がないことを確認する。

## Completion Criteria

- [x] US-12: GUIから保存済み台本をValidateできる。
- [x] US-13: GUIからVoiceとTimelineを生成できる。
- [x] US-14: VOICEVOX失敗ログと復旧ヒントを表示できる。
- [x] US-17: 長時間処理の状態、ログ、Stopを操作できる。
- [x] 手動操作とU4 Command Proposalが同じ安全な実行境界を使用する。
- [x] 全plan checkboxが完了し、U6 code summaryと検証結果が保存されている。

## Content Validation

- Mermaid図とASCII図は含めていない。
- Markdown構造、パス、コード識別子を検証済み。
- Application codeはworkspace root、documentationは `aidlc-docs/` に限定する。

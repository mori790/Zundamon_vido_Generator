# Code Generation Plan: U5 Asset Selection and Visual Attachment

## Unit Context

- **Unit**: U5 Asset Selection and Visual Attachment
- **Primary Stories**: US-10、US-11
- **Supports**: US-9
- **Dependencies**: U1 Electron App Shell、U3 ScriptDraft and Scene Editor
- **Infrastructure Design**: local Electron内の変更で新規インフラがないためスキップ
- **Implementation Principle**: 既存TypeScript、React、Electron、Vitest、React Testing Libraryとplatform APIだけを使い、新規dependencyを追加しない

## Boundaries

- U3 `ScriptDraft`と`updateDraftScene`を再利用する。
- canonical scriptの保存はU3 Applyだけが行う。
- U5は画像copy、exists、TrashとScene image visual編集だけを所有する。
- U6 validation、U7 preview、U8 renderを先行実装しない。
- renderer `nodeIntegration`方式を維持し、IPC migrationを追加しない。

## Target Files

### Create

- `src/studio/shared/asset.ts`
- `src/studio/renderer/asset-file-access.ts`
- `tests/studio/asset.test.ts`
- `tests/studio/asset-electron.e2e.ts`
- `aidlc-docs/construction/u5-asset-selection-and-visual-attachment/code/summary.md`

### Modify

- `src/studio/renderer/ScriptReviewPanel.tsx`
- `src/studio/renderer/StudioApp.tsx`
- `src/studio/renderer/main.tsx`
- `src/studio/renderer/styles.css`
- `src/studio/shared/script-draft.ts`
- `tests/studio/ScriptReviewPanel.test.tsx`
- `tests/studio/StudioApp.test.tsx`
- `package.json`

## Implementation Steps

### Step 1: Shared Asset Rules

- [x] `src/studio/shared/asset.ts`を作成する。
- [x] 20 MB上限、PNG/JPEG extension、public path生成を定義する。
- [x] Scene、background、BGMのasset reference収集を実装する。
- [x] 未参照判定とScene単位asset status型を実装する。
- [x] destinationへ任意pathを渡さないresult contractを定義する。

### Step 2: Renderer Asset File Access

- [x] `src/studio/renderer/asset-file-access.ts`を作成する。
- [x] native file inputと`webUtils.getPathForFile`でPNG/JPEGを選択する。
- [x] `realpath`、通常file、extension、20 MB、destination containmentを検証する。
- [x] `createImageBitmap`で完全decodeし、resourceを解放する。
- [x] `fs/promises`でmkdir、collision check、copy、existsを実装する。
- [x] `shell.trashItem`で復元可能な削除を実装する。
- [x] production adapterと注入可能な`AssetFileAccess` interfaceを公開する。

### Step 3: Missing Asset Checker

- [x] image referenceをScene ID付きで収集する。
- [x] 最大100 Sceneを`Promise.all`でexists検査する。
- [x] available、missing、failedを個別結果として返す。
- [x] generation IDで古い非同期結果をcommitしない境界を用意する。

### Step 4: ScriptReviewPanel Asset Coordinator

- [x] `ScriptReviewPanel`へoptional `assetFileAccess` propを追加する。
- [x] workspace global asset lockとmanual Retry stateを所有する。
- [x] validate-copy-commit順序でSelectとReplaceを実装する。
- [x] copy成功後だけ既存`patchScene`でimage visualを更新する。
- [x] U3 `ScenePatch`へ既存schemaの`visual` fieldを追加する。
- [x] collision confirmationでCancelとReplaceを実装する。
- [x] Remove時にreference解除と未参照判定を行う。
- [x] Keep FileとMove to Trash confirmationを実装する。

### Step 5: Structured Scene Asset UI

- [x] Scene detailへSelect Image、Replace、Removeを追加する。
- [x] image visualのpath、position、fitを表示・編集する。
- [x] 新規image visualを`center`、`contain`で作成する。
- [x] Scene rowと詳細へmissing状態をテキスト表示する。
- [x] copy中、failed、Retryを表示する。
- [x] stable `data-testid`、accessible name、`aria-busy`を追加する。

### Step 6: Composition Root Injection

- [x] `StudioApp`から`ScriptReviewPanel`へAsset File Accessを渡すprop境界を追加する。
- [x] production adapterをrenderer composition rootで生成する。
- [x] E2E用adapterを同じ境界へ注入できるようにする。
- [x] component内部へ環境変数分岐を置かない。

### Step 7: Styling

- [x] `styles.css`へimage visual editor、missing、confirmation、busy stateの最小styleを追加する。
- [x] keyboard focusを視認可能にする。
- [x] U3/U4既存layoutを壊さない。

### Step 8: Shared and Adapter Tests

- [x] `tests/studio/asset.test.ts`を作成する。
- [x] 20 MB境界、extension、public path、reference収集、未参照判定をテストする。
- [x] temporary directoryでcopy、collision、missing、containmentをテストする。
- [x] decode、Trash、failureは注入したplatform functionでテストする。

### Step 9: Component and Integration Tests

- [x] `ScriptReviewPanel.test.tsx`へSelect、Cancel、collision、Replaceを追加する。
- [x] missing Scene row/detail、position、fit、Removeをテストする。
- [x] global lock、manual Retry、Trash failureをテストする。
- [x] `StudioApp.test.tsx`でAsset File Access injectionをテストする。
- [x] U3/U4既存期待値を維持する。

### Step 10: Electron E2E

- [x] `tests/studio/asset-electron.e2e.ts`を作成する。
- [x] Electronを実際に起動し、app readinessを確認する。
- [x] composition rootへ固定test image adapterを注入する。
- [x] workspace open、draft作成、image添付、Scene reference反映を確認する。
- [x] child processとtemporary fileを必ずcleanupする。
- [x] `package.json`へ明示的なU5 Electron E2E scriptを追加する。

### Step 11: Code Summary

- [x] U5 code summaryを作成する。
- [x] 作成・変更ファイルとUS-10、US-11、supporting US-9を対応付ける。
- [x] Extension Rule Complianceを記録する。

### Step 12: Verification

- [x] `npx tsc --noEmit`を実行する。
- [x] `npm test`を実行する。
- [x] U5 Electron E2E scriptを実行する。
- [x] `npm run studio:build`を実行する。
- [x] `npm run studio:dev -- --host 127.0.0.1`と`npm run studio:start`を短時間起動確認する。

## Story Traceability

- **US-10**: Select、decode、copy、collision、public path、Scene attachment。
- **US-11**: missing Scene表示、Replace、再検査、error recovery。
- **US-9 Support**: position、fit、Removeのstructured editing。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

## Approval Gate

このplanをU5 Code Generationのsingle source of truthとする。承認後、Step 1から順に実装し、各完了と同じinteractionでcheckboxを更新する。

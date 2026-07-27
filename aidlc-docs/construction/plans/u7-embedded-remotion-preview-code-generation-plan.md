# Code Generation Plan: U7 Embedded Remotion Preview

この計画はU7 Code Generationのsingle source of truthである。U5/U6の既存変更を保持し、共有ファイルは変更直前に再読する。

## Unit Context

- **Primary Story**: US-15。
- **Dependencies**: U1 Workspace、U3 Apply済みscript、U6 Command Runner。
- **Player**: 既存Remotion versionと一致する公式 `@remotion/player`。
- **Data target**: Apply済みscript、voice manifest、timeline。
- **Database entities**: なし。
- **Infrastructure**: なし。
- **Out of scope**: MP4 render、draft preview、multiple Players、filesystem watcher、disk preview cache。

## Contracts

- `checkPreview(videoId)` はsource metadata、missing/stale、required operations、capacity warningを返す。
- `loadPreview(videoId)` はschema-validated composition propsとsnapshotを返す。
- Workspace Preview CoordinatorはU3 ApplyとU6 Voice/Timeline successをlatest-queued refreshへ変換する。
- Embedded Player failureはPreview専用Error Boundaryで隔離する。
- FallbackはU6 Preview commandを使用する。

## Implementation Plan

### Step 1: Player dependency

- [x] 現在解決されているRemotion versionを確認する。
- [x] 同じversionの `@remotion/player` をdirect dependencyとして追加し、lockfileを更新する。
- [x] 新しいPlayer以外のdependencyを追加しない。

### Step 2: Shared preview model and readiness logic

- [x] `src/studio/shared/preview.ts` にPreviewSource、Readiness、Snapshot、LoadResult型を追加する。
- [x] missing/stale、required operations、capacity warning、latest-queued refreshの純粋ロジックを追加する。
- [x] `tests/studio/preview.test.ts` でreadiness、timestamp、capacity、refresh coalescingを検証する。

### Step 3: Electron PreviewDataService

- [x] `src/studio/main/preview-data-service.ts` に `checkPreview(videoId)` と `loadPreview(videoId)` を追加する。
- [x] 既存videoId validation、manifest/timeline stores、`buildRenderData` を再利用する。
- [x] Rendererから任意pathを受け付けず、schema-validated dataだけを返す。
- [x] `tests/studio/preview-data-service.test.ts` でmissing、stale、ready、load failureを検証する。

### Step 4: IPC, preload, and renderer client

- [x] 変更直前に `src/studio/main/main.ts` と `src/studio/main/preload.ts` を再読し、U5/U6変更を保持する。
- [x] preview check/load IPC handlersとPreload APIを追加する。
- [x] `src/studio/renderer/preview-client.ts` に型付きwrapperを追加する。
- [x] `tests/studio/preview-client.test.ts` でAPI委譲とunavailable処理を検証する。

### Step 5: Preview Coordinator

- [x] `src/studio/renderer/preview-coordinator.ts` または最小hookにlatest-queued refreshを実装する。
- [x] U3 Apply successとU6 Voice/Timeline successをrefresh triggerへ接続する。
- [x] 不足artifactをU6 Voice、Timelineの順で自動生成する。
- [x] videoId変更とunmountで旧resultとlistenersを破棄する。
- [x] coordinator testsでevent、generation sequence、coalescing、cleanupを検証する。

### Step 6: Preview Panel and Player boundary

- [x] `src/studio/renderer/PreviewPanel.tsx` を追加し、open時に `@remotion/player` をlazy loadする。
- [x] 既存 `ZundamonVideo` とcomposition propsをPlayerへ渡す。
- [x] Play/Pause、seek、volume、fullscreenをkeyboard-accessibleにする。
- [x] Preview専用Error Boundary、Retry、U6 Preview fallbackを追加する。
- [x] stableな `data-testid` を追加する。
- [x] `tests/studio/PreviewPanel.test.tsx` でstates、controls、capacity warning、Retry、fallbackを検証する。

### Step 7: Workspace integration

- [x] 変更直前に `src/studio/renderer/StudioApp.tsx`、`ProductionCommandPanel.tsx`、`styles.css` を再読し、U5/U6変更を保持する。
- [x] WorkspaceShellにPreview CoordinatorとPreviewPanelを追加する。
- [x] ProductionCommandPanelからoperation completionをCoordinatorへ通知できる既存boundaryを再利用または最小拡張する。
- [x] U3 Apply後のrefresh triggerを追加する。
- [x] U7に必要な最小CSSだけを追加する。
- [x] `tests/studio/StudioApp.test.tsx` にpreview integration coverageを追加する。

### Step 8: Documentation

- [x] `aidlc-docs/construction/u7-embedded-remotion-preview/code/summary.md` を作成する。
- [x] US-15 acceptance criteria、変更ファイル、manual smoke手順、制限を記録する。
- [x] Extension Rule Complianceを記録する。

### Step 9: Verification

- [x] `npx tsc --noEmit` を実行する。
- [x] U7対象テストを実行する。
- [x] 全テストを実行する。
- [x] `npm run studio:build` を実行する。
- [x] Electronでsample-videoのPlayer表示、音声、seek、volume、fullscreen、fallbackをmanual smoke確認する。
- [x] 生成済みsampleでPlayer表示開始5秒以内を確認する。
- [x] 重複ファイルとU5/U6成果物への意図しない変更がないことを確認する。

## Completion Criteria

- [x] US-15 AC1: valid render dataをGUI内Playerでpreviewできる。
- [x] US-15 AC2: missing/stale dataを判定し、必要な生成と自動refreshを行える。
- [x] US-15 AC3: embedded failure時にRemotion Studio fallbackを開始できる。
- [x] Keyboard、visible focus、accessible labels、text statusを備える。
- [x] 全plan checkbox、tests、build、summary、manual smokeが完了している。

## Content Validation

- Mermaid図とASCII図は含めていない。
- Markdown構造、paths、identifiersを検証済み。
- Application codeはworkspace root、documentationは `aidlc-docs/` に限定する。

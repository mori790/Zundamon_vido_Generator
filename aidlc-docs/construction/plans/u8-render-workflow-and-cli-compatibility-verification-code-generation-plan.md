# Code Generation Plan: U8 Render Workflow and CLI Compatibility Verification

この計画はU8 Code Generationのsingle source of truthである。U5〜U7の既存変更を保持し、共有ファイルは変更直前に再読する。

## Unit Context

- **Primary Stories**: US-2、US-16、US-19。
- **Supporting Story**: US-17。
- **Dependencies**: U1 Workspace、U3 active script、U5 assets、U6 Command Runner、U7 readiness。
- **Render execution**: Existing `npm run render -- {videoId}` and U6 single Command Runner。
- **Frame concurrency**: Existing Remotion internal concurrency。Application-level concurrent Renderは1件。
- **Output**: Canonical `output/{videoId}.mp4`。
- **Database entities**: なし。
- **Infrastructure**: なし。
- **Out of scope**: Multi-video queue、new worker framework、automatic partial cleanup、MP4 metadata parser、cloud upload。

## Contracts

- `Operation` はoptional Render progressを保持し、existing operation event/snapshotで配信する。
- Render scriptはfixed-prefix structured progress recordをstdoutへ出す。
- Command Runnerはprogress recordをparseし、Render exit 0後にcanonical non-zero outputをpostflight検証する。
- Render output APIはvideoIdだけを受け、status、overwrite confirmation、revealを提供する。
- GUI RenderはU7 readiness、output status、native confirmationを通過した場合だけU6 Renderを開始する。
- Existing CLI commands、arguments、paths、schemasは維持する。

## Implementation Plan

### Step 1: Shared progress and output contracts

- [x] 変更直前に `src/studio/shared/command.ts` と `src/types/video.ts` を再読する。
- [x] `Operation` にoptional renderedFrames、totalFrames、fraction、etaSecondsを追加する。
- [x] Render progress recordのfixed prefix、serialize/parse、range validationをshared logicへ追加する。
- [x] Render output status、confirmation、revealのvideoId-only API型を追加する。
- [x] `tests/studio/command.test.ts` またはU8専用testでvalid/malformed progress recordを検証する。

### Step 2: Render Service progress and ETA

- [x] 変更直前に `src/core/render-service.ts` と `scripts/generate-video.ts` を再読する。
- [x] Remotion `renderMedia` callbackからmonotonic progress、frames、ETAを計算する。
- [x] Progressをthrottleし、final 100%を必ず通知する純粋helperを追加する。
- [x] Existing RenderOptionsを後方互換のoptional progress callbackで拡張する。
- [x] CLI render scriptからstructured progress recordをstdoutへ出す。
- [x] Progress、ETA、throttle、final updateのunit testsを追加する。

### Step 3: RenderOutputService

- [x] `src/studio/main/render-output-service.ts` にstatus、verify、confirmOverwrite、revealを追加する。
- [x] Existing videoId validationとcanonical output resolverを再利用する。
- [x] `stat` でregular non-zero outputを検証する。
- [x] Electron native message boxと `shell.showItemInFolder` をinjected boundaryとして使用する。
- [x] Arbitrary pathをRendererから受け付けず、partial outputを削除しない。
- [x] Missing、zero-byte、non-zero、unsafe videoId、confirm、reveal testsを追加する。

### Step 4: Command Runner progress and postflight

- [x] 変更直前に `src/studio/main/command-runner.ts` と既存testsを再読する。
- [x] Render stdout progress recordをinterceptし、Operation progressとsnapshotを更新する。
- [x] Malformed recordをcrashさせずdiagnostic logとして保持する。
- [x] Render exit 0後にinjected output verifierを実行し、failureをterminal Operationへ反映する。
- [x] Stop/failure時はpartial output warningを追加し、自動削除しない。
- [x] Existing Validate、Voice、Timeline、Preview behaviorを変更しない。
- [x] Runner testsでprogress、snapshot、postflight success/failure、Stop warningを検証する。

### Step 5: IPC, preload, and renderer client

- [x] 変更直前に `src/studio/main/main.ts` と `src/studio/main/preload.ts` を再読し、U5〜U7変更を保持する。
- [x] RenderOutputServiceをmain processへ接続し、Command Runner postflightへverify boundaryを注入する。
- [x] Output status、overwrite confirmation、reveal IPC handlersとPreload APIを追加する。
- [x] `src/studio/renderer/render-client.ts` にtyped wrapperを追加する。
- [x] Renderer client testsでdelegationとunavailable処理を検証する。

### Step 6: GUI Render workflow

- [x] 変更直前に `ProductionCommandPanel.tsx`、`StudioApp.tsx`、`styles.css` とtestsを再読する。
- [x] Manual buttonとCodex-approved Renderの両方を同じreadiness/output/confirmation gateへ通す。
- [x] U7 `checkPreview(videoId)` をreadinessに再利用し、missing/staleと必要operationをtext表示する。
- [x] Existing output時はnative confirmation resultがtrueの場合だけRenderを開始する。
- [x] Render progress percentとETAをaccessible textで表示する。
- [x] Success時にcanonical output pathとstable `data-testid` 付きreveal actionを表示する。
- [x] Failure/Stop時にpartial output warningを表示し、existing Render buttonでmanual retry可能にする。
- [x] ProductionCommandPanelとStudioApp testsでblocked、cancel、progress、success、reveal、failure、Codex proposal gateを検証する。

### Step 7: CLI compatibility verification

- [x] Existing allowlisted command mappingがvalidate、voice、timeline、preview、renderを維持することを自動テストする。
- [x] GUI-created script/assetsがexisting schemaとcanonical pathsを維持するtest coverageを確認または追加する。
- [x] Existing npm scriptsとargumentsを変更していないことを確認する。
- [x] Environment-dependent VOICEVOX、Preview、actual Renderをmanual verificationへ分離する。

### Step 8: Documentation

- [x] `aidlc-docs/construction/u8-render-workflow-and-cli-compatibility-verification/code/summary.md` を作成する。
- [x] US-2、US-16、US-17、US-19 acceptance criteria、変更file、manual integration手順、制限を記録する。
- [x] Internal frame concurrencyとsingle application-level Renderのclarificationを記録する。
- [x] Extension Rule Complianceを記録する。

### Step 9: Verification

- [x] `npx tsc --noEmit` を実行する。
- [x] U8対象testsを実行する。
- [x] 全default testsを実行する。
- [x] `npm run studio:build` を実行する。
- [x] `npm run validate -- sample-video` を実行する。
- [x] VOICEVOX起動環境でvoice、timeline、preview、renderのmanual compatibilityを確認する。
- [x] Actual Renderでprogress、ETA、non-zero output、overwrite confirmation、Stop、partial warning、native revealを確認する。
- [x] 4K/60fps/30分capacity boundaryをmanual確認またはenvironmental limitationとして記録する。
- [x] Duplicate files、unexpected dependency、U5〜U7成果物への意図しない変更がないことを確認する。

## Story Completion Criteria

- [x] US-2: GUI-created projectを全existing CLI commandsが利用できる。
- [x] US-16: Readinessとoverwrite gate後にRenderし、verified output pathとnative revealを表示できる。
- [x] US-17: Long-running Renderのstatus、logs、percent、ETA、terminal stateを表示できる。
- [x] US-19: Failureとpartial warningを表示し、existing Render buttonからmanual retryできる。
- [x] 全plan checkbox、tests、build、summary、manual integrationが完了している。

## Content Validation

- Mermaid図とASCII図は含めていない。
- Markdown構造、paths、identifiers、checkboxesを検証済み。
- Application codeはworkspace root、documentationは `aidlc-docs/` に限定する。

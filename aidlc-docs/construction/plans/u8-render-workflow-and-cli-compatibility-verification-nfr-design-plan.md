# NFR Design Plan: U8 Render Workflow and CLI Compatibility Verification

## Unit Context

- **Unit**: U8 Render Workflow and CLI Compatibility Verification。
- **NFR Requirements**: 承認済み。
- **Design Targets**: 4K/60fps/30分、progress/ETA、non-zero output verification、non-destructive failure、native reveal、CLI compatibility。
- **No Infrastructure**: Local single-user Electron application。Queue、cache、load balancer、cloud workerはN/A。

## Plan

### Answer Validation

- [x] すべての `[Answer]:` を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] Worker pool contradictionのclarification answerを回収する。
- [x] Worker pool parallelization scopeのclarification answerを回収する。
- [x] Clarification answerを再検証する。

### Step 1: Performance and Capacity Patterns

- [x] Progress/ETA transportとthrottling patternを設計する。
- [x] 4K/60fps/30分capacity boundaryとsingle-operation policyを設計する。
- [x] Renderer reconnect時のprogress snapshotを設計する。

### Step 2: Reliability and Resilience Patterns

- [x] Readiness、overwrite、render、postflight verification state machineを設計する。
- [x] Stop/failure/partial output warning patternを設計する。
- [x] Manual retryとno automatic cleanup policyを設計する。

### Step 3: Security and File Patterns

- [x] videoId-only output status/reveal IPC contractを設計する。
- [x] Canonical output resolutionとnon-zero verificationを設計する。
- [x] Overwrite approvalとCLI behavior separationを設計する。

### Step 4: Logical Components

- [x] RenderWorkflow、RenderOutputService、U6 integration boundaryを設計する。
- [x] Progress calculationとoutput postflight ownershipを設計する。
- [x] Automated compatibility testsとmanual media testsを設計する。

### Step 5: Generate Artifacts

- [x] `nfr-design-patterns.md` を作成する。
- [x] `logical-components.md` を作成する。
- [x] Markdown、traceability、Extension Rule Complianceを検証する。

## NFR Design Questions

各質問の `[Answer]:` へ選択肢の文字を記入してください。

## Question 1
Render progressとETAをU6からRendererへどう伝達しますか？

A) Existing `Operation` にprogress fieldsを追加し、throttled operation eventsとsnapshotを再利用する

B) Render専用progress IPC eventとsnapshot APIを追加する

C) Existing log textをRendererでparseしてprogressを計算する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Question 2
Progress throttlingとETA計算はどこが所有しますか？

A) Render ServiceがRemotion callbackをthrottleし、percentとETAをU6へ渡す

B) U6 Command Runnerが全frame eventsを受け、throttleとETAを計算する

C) Renderer UIが全progress eventsからthrottleとETAを計算する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Question 3
Process exit 0後のnon-zero output verificationはどこでterminal statusへ反映しますか？

A) U6 Command Runnerのrender postflightで検証し、失敗ならOperationをfailedにする

B) RendererのRenderWorkflowが別途検証し、Operationはsucceededのままresultだけerrorにする

C) CLI render script自身が検証し、exit codeを非0にする

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Question 4
Readinessとoutput statusのlocal APIをどう構成しますか？

A) U7 `checkPreview(videoId)` をreadinessに再利用し、output status/revealだけを狭いAPIとして追加する

B) U8専用APIへreadiness、output status、revealをすべてまとめる

C) RendererがNode filesystem APIで直接すべて確認する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Question 5
Overwrite confirmationはどのUI patternを採用しますか？

A) Accessible React dialogをRenderWorkflow内に置き、focusを開始buttonへ戻す

B) Electron native message boxをmain processから表示する

C) Production Panel内のinline confirmation rowを使用する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Question 6
4K/60fps/30分とsingle-user local scalingに追加componentは必要ですか？

A) Existing single Command Runnerだけを使用し、queue、cache、worker poolを追加しない

B) Render専用worker process poolを追加する

C) Local persistent render queueを追加する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Content Validation

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式、空行、`[Answer]:` tags、identifiersを検証済み。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

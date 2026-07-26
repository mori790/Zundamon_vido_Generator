# NFR Design Plan: U5 Asset Selection and Visual Attachment

## Unit Context

- **Unit**: U5 Asset Selection and Visual Attachment
- **Primary Stories**: US-10、US-11
- **Dependencies**: U1、U3
- **NFR Targets**: 20 MB、2秒、Trash deletion、full image decode、Electron E2E
- **Constraint**: 既存dependencyとrenderer `nodeIntegration`を継続する

## Plan

### Step 1: Analyze NFR Requirements

- [x] U5 NFR RequirementsとTech Stack Decisionsを読む。
- [x] U5 Functional Designのfile lifecycleとdraft boundariesを確認する。
- [x] resilience、scalability、performance、security、logical componentsの設計判断を抽出する。

### Step 2: Resolve NFR Design Decisions

- [x] NFR Design questionsを作成する。
- [x] すべての`[Answer]:`を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] clarification questionsは不要と判定する。

### Step 3: Generate NFR Design

- [x] `nfr-design-patterns.md`を作成する。
- [x] `logical-components.md`を作成する。

### Step 4: Validate and Complete

- [x] Markdown構文を検証する。
- [x] NFR Requirements traceabilityを検証する。
- [x] Extension Rule Complianceを記録する。
- [x] U5 NFR Design completion messageを提示する。

## NFR Design Questions

各質問の`[Answer]:`へ選択肢の文字を記入してください。

### Question 1
copy、decode、Trashが失敗した場合のretry patternはどれですか？

A) 自動retryせず、状態を維持してユーザーのRetry操作だけを提供する

B) 1回だけ自動retryし、それでも失敗したらユーザーRetryを提供する

C) 最大3回までexponential backoffで自動retryする

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 2
最大100 Sceneのmissing asset検査をどう実行しますか？

A) 全image referenceを`Promise.all`で並列検査する

B) 10件ずつの固定concurrencyで検査する

C) Sceneを順番に1件ずつ検査する

D) 選択中Sceneだけ検査し、全体検査はU6まで待つ

E) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 3
PNG/JPEGの完全decodeをどのpatternで行いますか？

A) Browser標準`createImageBitmap`を使い、rendererで非同期decodeする

B) Electron `nativeImage`でdecodeする

C) hidden `<img>`とobject URLでdecodeする

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 4
同名collisionと同時操作のraceをどう防ぎますか？

A) workspace全体でasset operationを1件だけ許可するglobal lock

B) Scene ID単位でlockし、異なるSceneの操作は並列許可する

C) destination public path単位でlockする

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 5
destination containmentをどのpatternで検証しますか？

A) `path.resolve`したbaseとcandidateのprefix boundaryを検証し、sourceは`realpath`と通常fileを確認する

B) file nameから`/`と`..`を除去する文字列検証だけにする

C) destination作成後に`realpath`だけを比較する

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 6
Electron E2Eのtest seamをどこへ置きますか？

A) `StudioApp` composition rootでtest用Asset File Access adapterを注入する

B) 環境変数でOS dialogが固定pathを返すtest modeをAsset Manager内に追加する

C) 実OS dialogをComputer Useで操作する

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

# NFR Design Plan: U7 Embedded Remotion Preview

## Unit Context

- **Unit**: U7 Embedded Remotion Preview。
- **NFR Requirements**: 承認済み。
- **Design target**: 5秒以内のPlayer表示、単一Player、event-driven refresh、failure isolation、U6 fallback。
- **No infrastructure**: Local Electron applicationのためqueue、cloud cache、load balancerはN/A。

## Plan

### Answer Validation

- [x] すべての `[Answer]:` を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] Player error recoveryのclarification answerを回収する。
- [x] clarification answerを再検証する。

### Step 1: Performance and Capacity Patterns

- [x] Player bundle loading patternを設計する。
- [x] Preview propsのmemory lifecycleを設計する。
- [x] 連続refreshのcoalescing patternを設計する。
- [x] 1080p/30fps/30分のcapacity guardを設計する。

### Step 2: Reliability Patterns

- [x] readiness、generation、loadのstate machineを設計する。
- [x] Player error isolationとretry patternを設計する。
- [x] U6 Voice/Timeline failure propagationを設計する。
- [x] Remotion Studio fallback patternを設計する。

### Step 3: Security and IPC Patterns

- [x] videoId-only preview IPC contractを設計する。
- [x] schema-validated composition props boundaryを設計する。
- [x] listener cleanupとWorkspace isolationを設計する。

### Step 4: Logical Components

- [x] PreviewDataService、PreviewCoordinator、PreviewPanel、PlayerBoundaryを設計する。
- [x] U3 ApplyとU6 operation eventのintegration boundaryを設計する。
- [x] automated testsとmanual smoke test boundaryを設計する。

### Step 5: Generate Artifacts

- [x] `nfr-design-patterns.md` を作成する。
- [x] `logical-components.md` を作成する。
- [x] Markdown、traceability、Extension Rule Complianceを検証する。

## NFR Design Questions

各質問の `[Answer]:` へ選択肢の文字を記入してください。

## Question 1
`@remotion/player` のbundleはいつ読み込みますか？

A) Preview Panelを初めて開いたときにlazy loadする

B) Studio起動時のmain bundleへ含める

C) Workspaceを開いた直後にbackground preloadする

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 2
Preview data IPCはどの形にしますか？

A) readiness確認とprops読込を1つの `loadPreview(videoId)` responseへまとめる

B) `checkPreview(videoId)` と `loadPreview(videoId)` の2段階に分ける

C) file metadataだけIPCで返し、Rendererがreadinessを判定する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:b

## Question 3
U3 ApplyやU6成功イベントが短時間に連続した場合、refreshをどう制御しますか？

A) 実行中refreshを完了させ、最後に受けた1回だけ再実行する

B) 実行中refreshをcancelして最新requestを即時実行する

C) すべてのrefresh requestを順番に実行する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 4
Player rendering errorからの回復方式はどれにしますか？

A) Preview専用Error Boundaryで隔離し、RetryとRemotion Studio fallbackを表示する

B) Workspace全体のError Boundaryで画面を再読み込みする

C) error textだけを表示し、Workspaceを開き直して回復する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:b

## Question 5
読み込んだcomposition propsのcache方針はどれにしますか？

A) 現在のWorkspaceの最新snapshotだけmemoryに保持する

B) videoIdごとにsession中のsnapshotを保持する

C) propsをdisk cacheへ保存する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 6
U6 operation eventsとの接続はどこが所有しますか？

A) WorkspaceShellのPreview Coordinatorが購読し、PreviewPanelとProductionCommandPanelを調整する

B) PreviewPanelがU6 Command Clientを直接購読する

C) ProductionCommandPanelがPreviewPanelへcallbackを渡す

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Content Validation

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式、空行、`[Answer]:` tagsを検証済み。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

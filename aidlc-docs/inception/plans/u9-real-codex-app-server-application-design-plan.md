# Application Design Plan: U9 Real Codex App Server Integration

このplanはU9 Application Designのsingle source of truthである。回答後、すべてのstepを順番に実行し、完了したstepは同じinteractionで `[x]` に更新する。

## Design Steps

### Step 1: Context and Boundary Analysis

- [x] U9 requirements、execution plan、existing U2/U4/U6 designとcurrent implementationを読む。
- [x] Renderer-owned Mock connection、Electron main IPC、chat persistence、approval flowを確認する。
- [x] Security、Resiliency、full PBT extension constraintsを確認する。
- [x] Application Designで必要なuser decisionsを特定する。

### Step 2: Resolve Design Questions

- [x] 全 `[Answer]:` をユーザーが記入する。
- [x] 回答のmissing、invalid、ambiguity、contradictionを検証する。
- [x] 必要な場合はclarification questionsを追加して解消する。

### Step 3: Generate Mandatory Artifacts

- [x] `aidlc-docs/inception/application-design/u9-real-codex-app-server/components.md` を生成する。
- [x] `aidlc-docs/inception/application-design/u9-real-codex-app-server/component-methods.md` を生成する。
- [x] `aidlc-docs/inception/application-design/u9-real-codex-app-server/services.md` を生成する。
- [x] `aidlc-docs/inception/application-design/u9-real-codex-app-server/component-dependency.md` を生成する。
- [x] `aidlc-docs/inception/application-design/u9-real-codex-app-server/application-design.md` を生成する。

### Step 4: Validate Design

- [x] Main/Preload/Renderer responsibilityとmethod contractsの整合を検証する。
- [x] Approval requestがfail closedになることを検証する。
- [x] Process、stream、pending requestのcleanup ownershipを検証する。
- [x] Security、Resiliency、PBT complianceをrule ID単位で評価する。
- [x] Markdown、Mermaid、text alternative、special charactersをcontent validationする。

## Design Questions

## Question 1
Electron security hardeningをU9でどこまで実施しますか？

A) `contextIsolation: true`、`nodeIntegration: false`へ変更し、既存Renderer filesystem accessもtyped preload IPCへ移行する（Security Baseline準拠、推奨）

B) App Server IPCだけを追加し、既存のunsafe Renderer設定は残す（Security Baseline blocking findingになる）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 2
App Server service instanceのscopeはどれですか？

A) Electron applicationで1 instanceを共有し、active Workspaceのthreadだけを扱う（現行single-workspace UI向け、推奨）

B) BrowserWindowごとに1 instanceを起動する

C) Workspaceごとに複数instanceを常駐させる

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 3
Workspace thread IDをどこへ保存しますか？

A) `generated/studio/{videoId}/codex-session.json` にchat historyと分離して保存する（推奨）

B) 既存 `chat-history.json` のschemaへ追加する

C) Electron application-level storeへ全Workspace分をまとめて保存する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 4
App Serverのserver-initiated approval requestをUIへどう表現しますか？

A) Existing proposal cardのvisual patternを再利用する専用Pending Approval modelを追加し、protocol responseは専用controllerが返す（推奨）

B) Existing Proposal schemaへApp Server approval requestを直接混在させる

C) Electron native dialogだけでapprove/denyする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 5
Streaming中のchat history保存単位はどれですか？

A) Deltaはmemory上で表示し、assistant item completionまたはturn terminal時にだけ永続化する（推奨）

B) Deltaごとにchat historyを保存する

C) Turn完了時だけmessage全体を表示して保存する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 6
Rendererへ公開するApp Server APIはどの形にしますか？

A) connect、send、reconnect、disconnect、approval responseとtyped event subscriptionsだけを公開する（推奨）

B) Generic `request(method, params)` とraw notification subscriptionを公開する

C) Existing `CodexConnection` のrequest-response APIだけを維持し、streamingはmainで最終messageへ集約する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Extension Constraints

- Security Baseline: Question 1でunsafe Renderer境界を解消しない場合はblocking findingとなる。
- Resiliency Baseline: Single local process、bounded queues、timeouts、cleanup、manual reconnectを設計する。
- Property-Based Testing: Detailed property identificationはFunctional Designで実行する。Application Designではpure protocol codecとstateful coordinatorのtest seamsを保持する。

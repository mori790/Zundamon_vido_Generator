# NFR Requirements Plan: U9 Real Codex App Server Integration

## Step 1: Context Analysis

- [x] U9 Functional Designとtestable propertiesを読む。
- [x] Current package stackとCodex CLI/App Server availabilityを確認する。
- [x] Security、Resiliency、full PBTのapplicable constraintsを確認する。
- [x] Quantitative and tech-stack decisionsを特定する。

## Step 2: Resolve NFR Questions

- [x] 全 `[Answer]:` をユーザーが記入する。
- [x] Missing、invalid、ambiguous、contradictory answersを検証する。
- [x] 必要なclarification questionsを解消する。

## Step 3: Generate NFR Artifacts

- [x] `nfr-requirements.md` を生成する。
- [x] `tech-stack-decisions.md` を生成する。
- [x] PBT-09 framework、generator、shrinking、seed policyを記録する。

## Step 4: Validate and Complete

- [x] Performance、capacity、availability、security、maintainability、usabilityを検証する。
- [x] Security、Resiliency、PBT complianceをrule ID単位で評価する。
- [x] Content validationを実行する。
- [x] 全plan checkboxを完了する。

## NFR Questions

## Question 1
App Server process起動とinitialize handshakeのtimeoutはどれですか？

A) Process start 5秒、initialize 10秒（推奨）

B) Process start 10秒、initialize 30秒

C) 両方60秒

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 2
通常turnの最大実行時間はどれですか？

A) 10分でtimeoutし、UIから明示Stopも可能にする（推奨）

B) 30分でtimeoutする

C) Fixed timeoutなし。User Stopだけを使用する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 3
Unexpected process exit後のautomatic reconnect policyはどれですか？

A) 最大3回、500ms、1s、2sのbackoff後にmanual reconnectへ移る（推奨）

B) 最大1回だけ即時retryする

C) Automatic retryなしで即manual reconnectにする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 4
Protocolとuser dataのsize limitsはどれですか？

A) JSONL 1 MiB/line、user prompt 64 KiB、assistant item 1 MiB、pending requests 128（推奨）

B) JSONL 4 MiB/line、user prompt 256 KiB、assistant item 4 MiB、pending requests 512

C) Existing chat history 10 MiB limit以外は上限を設けない

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 5
Pending App Server approvalのtimeoutはどれですか？

A) 5分で自動deny（推奨）

B) 1分で自動deny

C) 30分で自動deny

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 6
Codex CLI compatibility policyはどれですか？

A) Minimum supported versionを0.145.0とし、startup capability probeでstable methodsを検証する（推奨）

B) Codex CLI 0.145.0だけをexact supportする

C) Version checkなしでmethod failure時だけerrorにする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 7
Full PBT用frameworkはどれですか？

A) `fast-check`をexact devDependencyとして追加し、Vitestでshrinkingとseed replayを使用する（PBT-09準拠、推奨）

B) 新規dependencyを避け、自作random generatorを使う（automatic shrinking不足でPBT-09 blocking findingになる）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 8
Local App Server diagnostic logのcapacity policyはどれですか？

A) In-memory 2,000 entries、prompt/content/credentialはredactし、application終了時に破棄する（推奨）

B) `generated/studio/logs/` に日次fileとして30日保存する

C) App Server diagnostic logを無効にする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 9
Dependency vulnerability gateはどれですか？

A) `npm audit`をBuildで実行し、production dependencyのhigh/criticalは解消または明示的な非到達性根拠がない限りblockingにする（推奨）

B) Criticalだけをblockingにする

C) Audit結果を記録するだけでblockingにしない（SECURITY-10 blocking findingになる）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Fixed NFR Context

- Local personal macOS tool、Low criticality。
- Cross-region DR、SLA、multi-zone、auto-scalingはN/A。
- Context isolation、Node integration removal、typed IPCはmandatory。
- Stable stdio protocol only。Experimental APIはdisabled。
- Existing Codex login only。Credential collection/storageなし。

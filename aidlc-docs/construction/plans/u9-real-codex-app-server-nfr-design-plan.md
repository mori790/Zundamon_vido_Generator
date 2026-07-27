# NFR Design Plan: U9 Real Codex App Server Integration

## Step 1: Analyze NFR Context

- [x] NFR Requirements、tech stack、Functional Design propertiesを読む。
- [x] Resilience、scalability、performance、security、logical component categoriesを評価する。
- [x] Security、Resiliency、full PBT extension constraintsを確認する。
- [x] User decisionsが必要なpatternsを特定する。

## Step 2: Resolve NFR Design Questions

- [x] 全 `[Answer]:` をユーザーが記入する。
- [x] Missing、invalid、ambiguous、contradictory answersを検証する。
- [x] 必要なclarification questionsを解消する。

## Step 3: Generate NFR Design Artifacts

- [x] `nfr-design-patterns.md` を生成する。
- [x] `logical-components.md` を生成する。
- [x] Security、Resiliency、PBT rule mappingを記録する。

## Step 4: Validate and Complete

- [x] Retryがturnをduplicateしないことを検証する。
- [x] Queue、buffer、timer、process、subscription cleanupを検証する。
- [x] PBT seed、shrinking、stateful model designを検証する。
- [x] Content validationを実行する。
- [x] 全plan checkboxを完了する。

## NFR Design Questions

## Question 1
Unexpected process exit後のretryでin-flight turnをどう扱いますか？

A) Connectionだけを再確立し、in-flight turnはfailed/interruptedとして再送しない（duplicate mutation防止、推奨）

B) 同じturn/start requestを1回だけ自動再送する

C) User promptをlocal queueへ戻して自動再実行する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 2
Pending request上限128へ到達した場合のbackpressureはどれですか？

A) New requestを`capacity-exceeded`で拒否し、既存pendingを保持する（推奨）

B) 最も古いpending requestをcancelしてnew requestを受け入れる

C) Capacityが空くまでnew requestを待機queueへ積む

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 3
Agent deltaのRenderer update batchingはどれですか？

A) 50ms interval、item completionとterminal eventは即時flush（推奨）

B) 100ms interval

C) Deltaごとに即時renderする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 4
3回のautomatic reconnect失敗後のcircuit behaviorはどれですか？

A) Circuitをopenにしてautomatic retryを停止し、manual reconnectだけでhalf-open probeする（推奨）

B) 30秒後にautomatic retryを再開する

C) App restartまでReal modeを完全disableする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 5
PBTのseed policyはどれですか？

A) Default runはrandom seedを出力し、failure時のseed/pathをreplay commandとして表示する（推奨）

B) 全runで固定seedを使用する

C) Localはrandom、将来CIだけ固定seedを使用する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 6
Electron、Vite、Vitestのsecurity upgradeはどうsequencingしますか？

A) Packageごとにsequential upgradeし、各stepでtypecheck、target tests、Studio buildを実行する（推奨）

B) 3 packageを一括upgradeして最後に全verificationする

C) U9ではElectronだけupgradeし、Vite/Vitestは非到達性根拠を記録する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 7
Resiliency mechanismsのtesting approachはどれですか？

A) Existing practiceを使用する（referenceを追記）

B) Formal practiceなし。Local fault-injection scenariosとreleaseごとのmanual recovery checklistを提案する（推奨）

C) Operationsへ延期し、test scenariosだけを今作成する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Clarification Question 8
Question 7で選択したexisting resiliency testing practiceはどれですか？

A) Existing `aidlc-docs/construction/build-and-test/` のmanual smoke-testとaudit workflowを使用し、U9 fault-injection/recovery casesを追加する

B) 適合するexisting practiceはないため、U9 Local Recovery Verification practiceを新規提案する

X) Other existing practice (please provide its name or document path after [Answer]: tag below)

[Answer]:a

## Fixed Design Constraints

- Approval、unknown server request、timeout、shutdownはfail closed。
- No unbounded waits、queues、buffers、retries。
- Stable stdio and existing Codex login only。
- Context-isolated purpose-specific IPC。
- PBT complements example-based critical-path tests。

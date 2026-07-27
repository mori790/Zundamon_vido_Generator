# Functional Design Plan: U9 Real Codex App Server Integration

このplanはU9 Functional Designのsingle source of truthである。

## Step 1: Unit Context

- [x] U9 requirements、existing stories US-3/4/5/8、Application Designを読む。
- [x] Existing `CodexConnection`、proposal、Workspace、chat history behaviorを確認する。
- [x] Functional ambiguityとintegration edge casesを特定する。

## Step 2: Resolve Questions

- [x] 全 `[Answer]:` をユーザーが記入する。
- [x] Missing、invalid、ambiguous、contradictory answersを検証する。
- [x] 必要なclarification questionsを解消する。

## Step 3: Generate Functional Artifacts

- [x] `business-logic-model.md` を生成する。
- [x] `business-rules.md` を生成する。
- [x] `domain-entities.md` を生成する。
- [x] `frontend-components.md` を生成する。
- [x] PBT-01に従い各componentのTestable Propertiesを記録する。

## Step 4: Validate and Complete

- [x] StoryとU9 acceptance criteriaへのtraceabilityを検証する。
- [x] State transitionsとfail-closed approval behaviorを検証する。
- [x] Security、Resiliency、PBT complianceを評価する。
- [x] Content validationを実行する。
- [x] 全plan checkboxを完了する。

## Functional Design Questions

## Question 1
保存済みthreadの`thread/resume`がnot found、archived、invalidで失敗した場合はどうしますか？

A) Error理由を表示し、ユーザーが「新しいthreadを開始」を押した場合だけsession IDを置換する（推奨）

B) 自動的にsession IDをclearして新しいthreadを開始する

C) Error表示だけ行い、session fileは手動削除まで保持する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 2
Turn実行中に追加promptが送信された場合はどうしますか？

A) Sendをdisabledにし、現在turnのterminal後に次のpromptを送れるようにする（推奨）

B) `turn/steer` としてactive turnへ追加する

C) Local queueへ保存し、順番に自動送信する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 3
Turn実行中にWorkspaceを切り替えた場合はどうしますか？

A) Current turnをinterruptし、terminal確認後にold subscriptionsを解除して新Workspaceへ接続する（推奨）

B) Turn完了までWorkspace切替を禁止する

C) Old turnをbackground継続し、即座に新Workspaceへ切り替える

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 4
1 turn内で複数のassistant message itemがcompletedした場合、chat historyへどう保存しますか？

A) Completed itemごとに別assistant messageとして順序を維持して保存する（推奨）

B) Turn内の全assistant itemを1 messageへ結合する

C) 最後のassistant itemだけを保存する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 5
Agent deltaの途中でturnがfailed/interruptedになった場合、partial textをどう扱いますか？

A) UIに「未完了」として表示するがcanonical chat historyには保存しない（推奨）

B) System metadata付きassistant messageとしてchat historyへ保存する

C) UIからも破棄する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 6
Stable schemaで認識できないserver-initiated requestを受信した場合はどうしますか？

A) Generic error responseでdenyし、安全なdiagnostic codeだけを表示する（推奨）

B) UIにraw requestを表示してユーザー判断を求める

C) Responseせずtimeoutへ委ねる

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Planned Testable Properties

- Protocol serialize/parse: Round-trip。
- Request correlation: Response orderに依存せずexact requestへsettleするInvariant。
- Approval controller: Each ID terminates at most onceというInvariantとstateful model。
- Session validation: Parse後のstateはvalid thread IDまたはnullというInvariant。
- Turn state machine: Terminal stateからnon-terminalへ戻らないInvariant。
- Input/line bounds: Out-of-range inputs are always rejectedというInvariant。

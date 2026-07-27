# Unit of Work Plan: GUI with Embedded Codex Panel

## Plan Checklist

- [x] Load requirements, user stories, application design, and execution plan.
- [x] Identify decomposition decision points.
- [x] Collect user answers for unit decomposition.
- [x] Analyze answers for ambiguity or contradictions.
- [x] Generate `unit-of-work.md` with unit definitions and responsibilities.
- [x] Generate `unit-of-work-dependency.md` with dependency matrix.
- [x] Generate `unit-of-work-story-map.md` mapping stories to units.
- [x] Validate unit boundaries and dependencies.
- [x] Ensure all stories are assigned to units.

## Mandatory Artifacts

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md`.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md`.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md`.
- [x] Validate unit boundaries and dependencies.
- [x] Ensure all stories are assigned to units.

## Initial Decomposition Direction

The application is a single local desktop app, not multiple deployable services. Therefore, units of work should be logical implementation modules inside one app.

Likely units:

- Electron App Shell and Workspace.
- Script Draft and Review.
- Codex Panel and Approval.
- Scene and Asset Editing.
- Command Runner and Logs.
- Preview and Render Integration.
- Compatibility and Verification.

## Questions

Please answer every `[Answer]:` tag below before unit artifacts are generated.

## Question 1
ユニット分解の粒度はどれがよいですか？

A) 実装しやすい細かめのユニットに分ける

B) 大きめの機能単位にまとめる

C) 最初は大きめに分け、Codex/Preview/Command Runnerだけ独立ユニットにする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
Codex App Server連携は独立ユニットにしますか？

A) 独立ユニットにする

B) GUI全体の一部としてまとめる

C) Codex接続と承認フローを同じ独立ユニットにする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
Remotionプレビューは独立ユニットにしますか？

A) 独立ユニットにする

B) レンダー/コマンド実行と同じユニットにする

C) MVPではプレビューをShould扱いにし、独立ユニットだが後回し可能にする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 4
npmコマンド実行とログ表示はどう分けますか？

A) Command RunnerとLog Panelを同じユニットにする

B) Command RunnerとLog Panelを別ユニットにする

C) Command Runnerを先に作り、Log Panelは最低限から始める

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 5
JSON下書きレビューとシーン編集はどう分けますか？

A) 同じユニットにする

B) JSON下書きレビューとシーン編集を別ユニットにする

C) 下書き状態管理を土台ユニットにし、JSONレビューとシーン編集をその上に分ける

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 6
後で実装に進む場合、最初に完成させたい縦断フローはどれですか？

A) 動画IDを開く、Codexで企画相談、JSON下書き表示まで

B) 動画IDを開く、JSON編集、保存、validate実行まで

C) 動画IDを開く、JSON適用、validate、voice、timeline、renderまで

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 7
ユニット成果物には実装順を含めますか？

A) 必ず含める

B) 依存関係だけ示し、実装順は後で決める

C) Must/Should優先度つきで推奨順を含める

X) Other (please describe after [Answer]: tag below)

[Answer]: a

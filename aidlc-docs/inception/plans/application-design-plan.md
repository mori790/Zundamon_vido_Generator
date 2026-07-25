# Application Design Plan: GUI with Embedded Codex Panel

## Design Plan Checklist

- [x] Load requirements, user stories, reverse engineering artifacts, and execution plan.
- [x] Identify main design decision points.
- [x] Collect user answers for application design choices.
- [x] Analyze answers for ambiguity or contradictions.
- [x] Generate `components.md` with component definitions and high-level responsibilities.
- [x] Generate `component-methods.md` with component interfaces and method signatures.
- [x] Generate `services.md` with service definitions and orchestration patterns.
- [x] Generate `component-dependency.md` with dependency relationships and communication patterns.
- [x] Generate consolidated `application-design.md`.
- [x] Validate design completeness and consistency.

## Design Scope

This design covers the application-level architecture for a local video production GUI with an embedded Codex panel.

The design should define:

- GUI application shell.
- Single-video workspace.
- Codex panel and Codex App Server adapter.
- Draft JSON and approval workflow.
- Raw JSON and structured scene editor.
- Asset selector and public path handling.
- Command runner and log streaming.
- Preview and render integration.
- Compatibility boundary with the existing CLI/core pipeline.

## Questions

Please answer every `[Answer]:` tag below before design artifacts are generated.

## Question 1
GUIの実装形態はどれを前提に設計しますか？

A) Electronなどのデスクトップアプリとして設計する

B) ローカルWebアプリとして設計し、ブラウザで開く

C) まずはローカルWebアプリとして設計し、将来的にデスクトップ化できる境界を残す

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
GUIと既存CLI/coreの接続はどれを前提にしますか？

A) GUIから既存npmコマンドを実行して連携する

B) GUI用のローカルバックエンドを作り、既存coreサービスを直接呼び出す

C) MVPはnpmコマンド実行を使い、設計上はcore直接呼び出しへ移行できる境界を作る

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
Codex App Serverとの接続境界はどれがよいですか？

A) GUIフロントエンドが直接Codex App Serverとやり取りする

B) ローカルバックエンドがCodex App Serverとやり取りし、GUIには抽象化したイベントを渡す

C) まずはバックエンド経由を前提にし、直接接続は採用しない

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 4
JSON下書きやチャット履歴の保存はどうしますか？

A) MVPではメモリ上だけで扱い、正式適用したJSONだけ保存する

B) `generated/` 配下などにGUI用ドラフトと会話メタデータを保存する

C) 専用の `projects/` または `.zundamon-studio/` のようなGUI状態ディレクトリを作る

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 5
プレビュー方式はどれを設計の主案にしますか？

A) GUI内にRemotion Player相当を埋め込む

B) GUIからRemotion Studioを起動し、別画面でプレビューする

C) 主案はGUI内プレビュー、フォールバックとしてRemotion Studio起動を設計に含める

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 6
Codexの実行承認UIはどれがよいですか？

A) Codexメッセージ内に「承認して実行」ボタンを出す

B) 画面上部やサイドバーに承認待ちキューを出す

C) メッセージ内ボタンと承認待ちキューの両方を用意する

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 7
Application Designの成果物では、実装技術をどこまで固定しますか？

A) Electron/React/Nodeなど、具体技術まで固定する

B) React/Node/Remotion/Codex App Serverは固定し、デスクトップ化方式は未確定にする

C) 技術は極力固定せず、責務と境界だけを設計する

X) Other (please describe after [Answer]: tag below)

[Answer]: a

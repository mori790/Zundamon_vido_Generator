# Functional Design Plan: U2 Codex App Server Connection

## Unit Context

- **Unit**: U2 Codex App Server Connection.
- **Priority**: Must.
- **Purpose**: Enable chat-based planning with Codex.
- **First vertical slice contribution**: After opening a video ID, the creator can discuss a video idea in a Codex panel.

## Functional Design Checklist

- [x] Load unit definition and story map.
- [x] Identify U2 business logic and UI state boundaries.
- [x] Collect user answers for U2 behavior.
- [x] Analyze answers for ambiguity or contradictions.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Generate `frontend-components.md`.
- [x] Validate functional design completeness.

## Stories Covered

- US-3: Discuss a video idea with Codex.
- US-4: Handle Codex authentication or connection failure.

## Questions

Please answer every `[Answer]:` tag below before functional design artifacts are generated.

## Question 1
U2の最初の実装はどちらを優先しますか？

A) まずGUI内のチャット体験をモック接続で作り、後でCodex App Server実接続に差し替える

B) 最初からCodex App Server実接続を目標にする

C) モックと実接続を切り替え可能にして、実接続が失敗しても開発できるようにする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
Codex未接続時、Codexパネルはどう表示しますか？

A) エラー表示だけにする

B) 未接続状態を表示し、入力欄は無効にする

C) 未接続状態を表示し、モック返信で企画相談UIを試せるようにする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
U2でCodexからJSON下書き生成まで扱いますか？

A) U2では会話だけ。JSON下書き検出はU4へ回す

B) U2でJSONらしき応答の表示までは扱うが、下書き状態にはしない

C) U2でJSON下書き状態まで作る

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 4
チャット履歴はU2 MVPで保存しますか？

A) メモリ上だけで保存し、アプリ終了で消えてよい

B) workspaceごとにローカルファイルへ保存する

C) Codex側のスレッド履歴に任せ、GUIは現在表示分だけ持つ

X) Other (please describe after [Answer]: tag below)

[Answer]: b

# NFR Requirements Plan: U2 Codex App Server Connection

## Unit Context

- **Unit**: U2 Codex App Server Connection.
- **Scope**: Codex panel, mock chat connection, connection state display, local chat history persistence, and disconnected/error handling.
- **Out of Scope**: JSON draft detection, action approval, command execution, rendering, and real Codex App Server protocol implementation.

## NFR Requirements Checklist

- [x] Load U2 functional design artifacts.
- [x] Identify NFR decision points for chat responsiveness, persistence, failure handling, and tests.
- [x] Collect user answers for U2 NFR choices.
- [x] Analyze answers for ambiguity or contradictions.
- [x] Generate `nfr-requirements.md`.
- [x] Generate `tech-stack-decisions.md`.
- [x] Validate NFR requirements completeness.

## Questions

Please answer every `[Answer]:` tag below before NFR artifacts are generated.

## Question 1
U2のチャット履歴保存先はどこにしますか？

A) `generated/studio/{videoId}/chat-history.json` に保存する

B) `.zundamon-studio/{videoId}/chat-history.json` に保存する

C) ElectronのuserData配下に保存する

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
モック返信の応答速度はどう扱いますか？

A) 即時返信でよい

B) 300ms程度の遅延を入れてチャットらしい挙動にする

C) 送信中/受信中状態を見せるため1秒程度の遅延を入れる

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 3
U2のテストでは何を必須にしますか？

A) chat stateとmock connectionの単体テストだけ必須にする

B) chat state/mock connection + CodexPanelコンポーネントテストを必須にする

C) 上記に加えて履歴保存のファイルI/Oテストも必須にする

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 4
実Codex App Server接続が未実装の間、UI上の表現はどうしますか？

A) 明確に「Mock」と表示する

B) 「Codex準備中」と表示し、Mockとは表示しない

C) 開発モードだけMock表示にする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

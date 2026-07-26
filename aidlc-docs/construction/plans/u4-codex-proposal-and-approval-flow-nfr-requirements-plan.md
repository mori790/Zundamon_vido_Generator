# U4 NFR Requirements Plan: Codex提案と承認フロー

## 対象

- Codex返答からの提案検出性能
- 提案状態の保存と復旧
- 承認操作の二重実行防止
- UI応答性とアクセシビリティ
- 既存TypeScript、React、Zod、Vitest構成への統合

## 評価手順

- [x] U4 Functional Design成果物を確認する。
- [x] U2チャット履歴とU3下書き境界を確認する。
- [x] 性能、信頼性、保守性、テスト容易性の判断項目を抽出する。
- [x] 回答を検証し、曖昧さまたは矛盾があれば追加確認する。
- [x] NFR Requirementsを作成する。
- [x] Tech Stack Decisionsを作成する。
- [x] Extension Rule Complianceを確認する。

## Question 1
提案検出と表示で想定する1件のCodex返答の最大サイズはどれですか？

A) 256 KB以下

B) 1 MB以下

C) 明示的な上限を設けず、現在のチャット実装と同じ扱いにする

D) Other（希望する上限を [Answer]: の後に記載してください）

[Answer]:b

## Question 2
通常サイズのCodex返答を受信してから提案カードを表示するまでの目標時間はどれですか？

A) 100 ms以内

B) 300 ms以内

C) 1秒以内

D) Other（希望する目標時間を [Answer]: の後に記載してください）

[Answer]:b

## Question 3
提案状態の保存に失敗した場合、ApproveまたはReject操作をどう扱いますか？

A) 状態保存が成功するまで操作結果を確定せず、再試行可能なエラーを表示する

B) 画面上の状態だけ更新し、保存失敗を警告する

C) 提案操作自体を無効化し、チャット履歴保存が復旧するまで待つ

D) Other（希望する扱いを [Answer]: の後に記載してください）

[Answer]:a

## Question 4
提案状態の保存形式はどれにしますか？

A) 既存の`chat-history.json`へChatMessageとProposalをまとめて保存する

B) 同じディレクトリの`proposal-history.json`へ分離して保存する

C) ChatMessage内にProposalを埋め込み、別コレクションを持たない

D) Other（希望する形式を [Answer]: の後に記載してください）

[Answer]:a

## Question 5
U4の自動テスト範囲はどれにしますか？

A) 提案抽出と状態遷移の単体テスト、CodexPanel承認操作のコンポーネントテスト、U3下書き受け渡しの統合テスト

B) 提案抽出と状態遷移の単体テストだけ

C) Aに加えて、チャット履歴ファイルの保存・復元テストも行う

D) Other（希望する範囲を [Answer]: の後に記載してください）

[Answer]:c

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

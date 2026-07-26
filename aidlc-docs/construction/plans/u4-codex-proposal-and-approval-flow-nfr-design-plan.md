# U4 NFR Design Plan: Codex提案と承認フロー

## 設計対象

- 保存失敗からの復旧パターン
- chat-history.jsonの増加境界
- 1 MB以下の提案抽出パターン
- JSONとコマンド提案の検証境界
- React、shared logic、永続化、U3/U6 dispatchの論理コンポーネント分割

## 設計手順

- [x] U4 NFR RequirementsとTech Stack Decisionsを確認する。
- [x] Resilience、Scalability、Performance、Security、Logical Componentsの判断項目を抽出する。
- [x] 回答を検証し、曖昧さまたは矛盾があれば追加確認する。
- [x] NFR Design Patternsを作成する。
- [x] Logical Componentsを作成する。
- [x] Extension Rule Complianceを確認する。

## Question 1
提案状態の保存失敗後の復旧方法はどれにしますか？

A) 自動再試行はせず、提案カードにRetryを表示してユーザーが再実行する

B) 短い間隔で1回だけ自動再試行し、それでも失敗した場合にRetryを表示する

C) 保存成功まで一定間隔で自動再試行する

D) Other（希望する復旧方法を [Answer]: の後に記載してください）

[Answer]:a

## Question 2
chat-history.jsonの増加に対するMVPの扱いはどれにしますか？

A) 履歴上限を設けず、1 video ID単位のローカルファイルとして保持する

B) 最新500メッセージと関連提案だけを保持する

C) ファイルが10 MBを超えた場合、古い完了済み提案とメッセージを削除する

D) Other（希望する扱いを [Answer]: の後に記載してください）

[Answer]:c

## Question 3
1 MB以下のMarkdown JSON抽出処理はどのパターンにしますか？

A) 受信完了時に同期処理し、300 ms目標をテストで確認する

B) `setTimeout`で次のイベントループへ回してから処理する

C) Web Workerへ分離する

D) Other（希望する処理方法を [Answer]: の後に記載してください）

[Answer]:a

## Question 4
保存済み提案を読み込む際の検証はどれにしますか？

A) 読み込み時に種類、状態、payloadを検証し、JSON提案はApprove時にも再度schema検証する

B) 読み込み時は最低限の形だけ確認し、Approve時にすべて検証する

C) 保存時に検証済みなので、読み込み時とApprove時の再検証は行わない

D) Other（希望する検証方法を [Answer]: の後に記載してください）

[Answer]:a

## Question 5
提案状態と承認処理の主な所有場所はどれにしますか？

A) shared層に純粋なProposal Controllerを置き、CodexPanelは表示と永続化・dispatch接続だけを担う

B) CodexPanel内部ですべて管理する

C) StudioAppで提案状態を一括管理し、CodexPanelへpropsで渡す

D) Other（希望する所有場所を [Answer]: の後に記載してください）

[Answer]:b

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

# U4 Functional Design Plan: Codex提案と承認フロー

## ユニットの前提

- **Unit**: U4 Codex Proposal and Approval Flow
- **Primary Stories**: US-5、US-7、US-18
- **Dependencies**: U2 Codex App Server Connection、U3 JSON Draft Review and Scene Editing
- **目的**: Codexの返答をレビュー可能なJSON下書きまたは操作提案として扱い、ユーザー承認なしのファイル変更とコマンド実行を防ぐ。
- **対象外**: コマンド実行基盤そのものはU6、JSONの正式保存処理はU3が所有する。

## 設計手順

- [x] U4の責務、ストーリー、U2/U3依存関係を確認する。
- [x] U2のチャットモデルとCodexPanelを確認する。
- [x] U3の下書きモデル、検証、Apply境界を確認する。
- [x] Functional Designの判断が必要な項目を抽出する。
- [x] 回答を検証し、曖昧さまたは矛盾があれば確認事項を追加する。
- [x] Business Logic Modelを作成する。
- [x] Business Rulesを作成する。
- [x] Domain Entitiesを作成する。
- [x] Frontend Componentsを作成する。
- [x] Extension Rule Complianceを確認する。

## Question 1
MVPでCodex返答からJSON下書き候補を検出する方法はどれにしますか？

A) MarkdownのJSONコードブロックを検出し、`VideoScript` schemaに適合したものだけを提案にする

B) Codex接続から受け取る構造化proposal eventだけを提案にする

C) 構造化proposal eventを優先し、存在しない場合だけMarkdownのJSONコードブロックを検出する

D) Other（希望する方法を [Answer]: の後に記載してください）

[Answer]:c

## Question 2
未適用の下書きがある状態で、新しいCodex JSON提案を承認した場合の動作はどれにしますか？

A) 現在の下書きを新しい提案で置き換える前に、追加確認を表示する

B) 現在の下書きを即座に新しい提案で置き換える

C) 新しい提案を拒否し、現在の下書きをDiscardしてから再承認するよう案内する

D) Other（希望する動作を [Answer]: の後に記載してください）

[Answer]:a

## Question 3
U6完成前のコマンド操作提案をU4でどのように扱いますか？

A) 提案とApprove/Reject UIまでは表示し、Approveは「Command Runner未接続」として失敗状態にする

B) U6完成までコマンド操作提案を表示しない

C) 提案を表示するがApproveを無効化し、U6未接続であることを表示する

D) Other（希望する扱いを [Answer]: の後に記載してください）

[Answer]:a

## Question 4
JSON提案をApproveした時点で行う処理はどれにしますか？

A) U3の編集可能な下書きとして読み込むだけで、正式保存はU3のApply操作に任せる

B) U3の下書きとして読み込み、直ちにU3のApply確認も表示する

C) schema validation成功時に正式JSONへ自動保存する

D) Other（希望する処理を [Answer]: の後に記載してください）

[Answer]:b

## Question 5
提案状態をチャット履歴へ保存する範囲はどれにしますか？

A) 提案内容と状態（pending、approved、rejected、completed、failed）を保存し、再起動後も表示する

B) 提案内容だけ保存し、状態は再起動時にpendingへ戻す

C) 提案と状態はメモリ内だけに保持し、通常のチャット本文だけ保存する

D) Other（希望する保存範囲を [Answer]: の後に記載してください）

[Answer]:b

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

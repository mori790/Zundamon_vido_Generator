# NFR Requirements: U4 Codex提案と承認フロー

## 性能と容量

- 1件のCodex返答は1 MB以下を提案検出対象とする。
- 1 MBを超える返答は通常メッセージとして表示し、提案抽出を行わず、上限超過を示す。
- 1 MB以下の返答では、受信完了から提案カード表示まで300 ms以内を目標とする。
- 構造化proposal eventがある場合はMarkdown走査を省略する。
- 提案抽出はUIを長時間ブロックせず、通常チャット表示を妨げない。

## 信頼性と操作安全性

- ApproveまたはRejectの結果は、提案状態の保存成功後に確定表示する。
- 保存に失敗した場合、対象提案は直前の状態に維持し、同じ操作を再試行できるエラーを表示する。
- コマンド提案は`approved`状態の保存成功前にU6へ渡さない。
- 同じ提案IDの二重Approveを防ぎ、1つのユーザー操作から複数のdispatchを発生させない。
- `completed`、`rejected`、`failed`の提案は再起動後も終端状態を維持する。
- 読み込み不能または不正な提案レコードは実行せず、通常チャットを可能な範囲で復元する。

## 永続化と互換性

- ChatMessageとProposalを`generated/studio/{videoId}/chat-history.json`へまとめて保存する。
- 既存のChatMessage配列形式を読み込める後方互換性を維持する。
- 新形式はmessagesとproposalsを分けた単一ドキュメントとする。
- 提案状態の保存は`input/{videoId}.json`を変更しない。
- video IDのpath sanitizationは既存`chatHistoryPath`を再利用する。

## セキュリティと承認境界

- JSON提案は既存`videoScriptSchema`で検証する。
- コマンド提案は定義済みoperationのallowlistだけを受け付け、任意shell文字列を保持または実行しない。
- Codex返答だけを根拠にファイル保存またはコマンド実行を開始しない。
- U3 ApplyとU6 Command Runnerの既存境界を迂回しない。

## ユーザビリティとアクセシビリティ

- `pending`、処理中、`completed`、`rejected`、`failed`をテキストで表示する。
- 保存中は同じ提案のApproveとRejectを無効化する。
- 保存失敗時は提案カード付近に再試行可能なエラーを表示する。
- Approve、Reject、置換確認はキーボード操作可能なbuttonで提供する。
- 確認UIには適切なラベルとフォーカス移動を提供する。

## 保守性

- 提案抽出、状態遷移、永続化データ検証をReact表示から分離する。
- U2のChatMessage、U3のVideoScript validationとdraft作成、U6のoperation型を再利用する。
- 提案検出のための新規パーサー依存関係を追加しない。

## テスト容易性

- 構造化event優先とMarkdown JSON fallbackを単体テストする。
- 1 MB境界、schema不適合、重複検出防止を単体テストする。
- 有効・無効な状態遷移と二重Approve防止を単体テストする。
- CodexPanelのApprove、Reject、置換確認、保存失敗をコンポーネントテストする。
- U3下書き受け渡しを統合テストする。
- chat-history.jsonの新形式、旧配列形式、保存・復元、不正レコード除外をファイルアクセス注入でテストする。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

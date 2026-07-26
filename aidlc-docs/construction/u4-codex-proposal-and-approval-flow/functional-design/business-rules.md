# Business Rules: U4 Codex提案と承認フロー

## 提案検出

- **BR-1**: 構造化proposal eventはMarkdown抽出より優先する。
- **BR-2**: Markdown抽出は`json`コードブロックだけを対象にする。
- **BR-3**: JSON提案は既存`videoScriptSchema`に適合しなければならない。
- **BR-4**: 同じCodex返答から構造化提案とMarkdown提案を重複登録しない。

## 承認境界

- **BR-5**: `pending`以外の提案はApproveまたはRejectできない。
- **BR-6**: JSON提案のApproveはU3下書きの作成までとし、正式JSONを保存しない。
- **BR-7**: 正式JSON保存はU3のApply確認とApply処理を必須とする。
- **BR-8**: 未適用下書きの置換には追加確認を必須とする。
- **BR-9**: 置換確認を取り消しても既存下書きと提案状態を変更しない。
- **BR-10**: コマンドはApprove前に実行してはならない。

## 状態遷移

- `pending -> approved`: Approveを受け付け、処理開始が可能になった。
- `pending -> rejected`: ユーザーが拒否した。
- `approved -> completed`: 下書き受け渡しまたはコマンド実行が成功した。
- `approved -> failed`: validation、接続、または実行が失敗した。
- `rejected`、`completed`、`failed`は終端状態とし、同じ提案を再実行しない。

## エラー

- **BR-11**: Approve時の再validation失敗は`failed`として問題を表示し、U3下書きを変更しない。
- **BR-12**: U6未接続時のコマンドApproveは`failed`とし、ファイルやプロセスを変更しない。
- **BR-13**: 提案状態の保存失敗は画面に表示し、実行結果を成功として扱わない。

## 永続化

- **BR-14**: 提案ID、種類、内容、状態、関連メッセージIDを保存する。
- **BR-15**: 再起動後も処理済み状態を維持する。
- **BR-16**: 再起動後に承認可能なのは保存時点で`pending`だった提案だけとする。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。

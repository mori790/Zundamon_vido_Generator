# Business Logic Model: U4 Codex提案と承認フロー

## 目的

Codexの返答を通常メッセージと提案に分け、提案をユーザーが明示的に承認または拒否するまで、下書き変更、ファイル保存、コマンド実行を行わない。

## JSON提案検出

1. Codex返答に構造化proposal eventがあれば、それを優先する。
2. 構造化proposal eventがなければ、Markdownの`json`コードブロックを出現順に検査する。
3. JSON parseと既存`videoScriptSchema`の両方に成功した最初のブロックだけをJSON提案にする。
4. schema不適合のコードブロックは通常メッセージとして表示し、提案にはしない。
5. 構造化proposal eventとMarkdownコードブロックを同じ返答から二重登録しない。

## JSON提案承認フロー

1. 提案を`pending`としてCodexメッセージ内に表示する。
2. Approve時に最新の提案内容を再検証する。
3. 未適用のU3下書きが存在する場合、置換確認を表示する。
4. 置換が取り消された場合、提案は`pending`のまま維持する。
5. 置換が確認された場合、提案をU3の編集可能な`ScriptDraft`へ変換する。
6. 提案を`completed`にし、U3のApply確認領域を表示する。
7. この時点では`input/{videoId}.json`を書き換えない。正式保存はU3のApply処理だけが行う。

## コマンド提案承認フロー

1. コマンド提案を`pending`としてApproveとRejectを表示する。
2. U6 Command Runner未接続時でもApprove操作を受け付ける。
3. 実行先が未接続なら提案を`failed`にし、「Command Runner未接続」を表示する。
4. U6接続後は、承認済み提案をCommand Runnerへ一度だけ渡す。
5. 実行結果に応じて`completed`または`failed`へ遷移する。

## Rejectフロー

1. `pending`提案だけRejectできる。
2. Rejectは提案を`rejected`へ変更する。
3. Rejectは下書き、正式JSON、コマンド状態を変更しない。

## 再起動時の復元

- 提案内容と状態をチャット履歴とともに保存する。
- 未処理の`pending`だけ承認可能な状態で復元する。
- `approved`、`rejected`、`completed`、`failed`は保存済み状態を維持する。
- 処理済みコマンド提案は再承認できない。

## Story Traceability

- **US-5**: Codex返答から有効なJSON提案を検出し、U3下書きへ渡す。
- **US-7**: 新しいCodex提案を既存下書きと置換確認したうえで再編集可能にする。
- **US-18**: すべての提案操作を明示的なApproveまたはRejectに限定する。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。

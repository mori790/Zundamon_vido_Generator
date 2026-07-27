# ビジネスルール: U6 コマンド実行とログパネル

## コマンド許可ルール

- GUIから実行できるコマンドは固定リストに限定する。
- 任意のシェル文字列は受け取らない。
- `videoId` はU1のワークスペース検証ルールに従う。
- コマンドは保存済みの `input/{videoId}.json` を対象にする。
- U3の未適用ドラフトはU6では無視する。

## 表示コマンド

初期実装では以下のボタンを表示する。

- Validate。
- Voice。
- Timeline。
- Preview。
- Render。

## 事前Validateルール

- Voice、Timeline、Preview、Renderの前には自動でValidateを実行する。
- Validateが失敗した場合、要求された本コマンドは開始しない。
- Validate単体の実行では追加の事前チェックを行わない。
- 事前Validateのログは、要求された操作のログ内で区切って表示する。

## 同時実行ルール

- Voice、Timeline、Preview、Renderは同時実行不可。
- これらのいずれかが実行中の場合、他のVoice、Timeline、Preview、Renderボタンは無効化する。
- Validateは他コマンド実行中でも実行可能。
- 同時Validateの結果は、既に実行中の他コマンドを自動停止しない。

## Stopルール

- 実行中の長時間コマンドにはStopを表示する。
- Stopは対象Operationに紐づく子プロセスを終了する。
- Stop要求後は状態を `stopping` にする。
- 終了が確認できたら `cancelled` にする。
- Stop後に生成途中のファイルが残る可能性はログで示すが、U6では自動削除しない。

## アクティブスクリプト前提ルール

- `input/{videoId}.json` が存在しない場合、Validate以外のコマンドは実行しない。
- Validateも既存CLIと同じ失敗を表示できるよう実行してよい。
- 空ワークスペースでは、生成系コマンドのボタンに「保存済み台本が必要」という状態を表示する。

## ログ保持ルール

- ログはStudioセッション中のみメモリに保持する。
- ログはOperation単位で保持する。
- ユーザーはログをクリアできる。
- 永続ログ保存は初期U6では実装しない。
- 将来のCodex診断連携では、現在メモリ上にあるログを渡す。

## 結果表示ルール

- 終了コード0は成功として扱う。
- 終了コード0以外は失敗として扱う。
- 起動失敗は失敗として扱う。
- Stopによる終了はキャンセルとして扱う。
- stdoutとstderrは区別して表示する。

## 拡張ルール適用状況

- Security Baseline: `aidlc-state.md` で無効のためスキップ。
- Resiliency Baseline: `aidlc-state.md` で無効のためスキップ。
- Property-Based Testing: `aidlc-state.md` で無効のためスキップ。

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown構文は見出しと箇条書きのみを使用している。

# NFR Design Patterns: U6 コマンド実行とログパネル

## 実行境界

- Rendererは固定の `CommandType` と `videoId` だけをIPCへ渡す。
- Electron main processの `CommandCatalog` が既存npm scriptへ変換する。
- シェル文字列は受け付けず、`spawn`へ実行ファイルと引数配列を渡す。
- `videoId` は既存Workspace境界と同じ検証を通し、作業ディレクトリはWorkspace rootに固定する。
- npmを起動できない場合は `spawn-failed` として終了コード失敗と区別する。

## Operation Lifecycle

状態は `idle`、`validating`、`running`、`stopping`、`succeeded`、`failed`、`cancelled` とする。

- Validate以外の操作は、1つのOperation内で `preflight` と `command` の2フェーズを持つ。
- `preflight` が失敗した場合、本コマンドは起動しない。
- ワークスペースごとに実行中Operationは1つだけ許可する。
- 終了状態のOperationは同じCommandTypeで再実行できる。
- Main processの状態イベントを即時送信し、Rendererは受信後200ms以内に反映する。

## ログ処理

- Main processはstdout、stderr、systemを行単位の `LogEntry` に正規化する。
- Operationごとに最新1,000行を保持し、超過分は先頭から破棄する。
- Rendererはログイベントを即時受信し、表示更新だけを短時間バッチ化する。
- Clear Logsは表示中Operationの保持ログだけを消し、プロセス状態には影響しない。
- 初期U6ではログをディスクへ永続化しない。

## Stopと失敗分類

- Stop要求で状態を `stopping` にし、プロセスツリーへ正常終了を要求する。
- 10秒後も終了しない場合はプロセスツリーの強制終了を試みる。
- Stop完了は `cancelled`、起動不能は `spawn-failed`、非ゼロ終了は `command-failed` とする。
- Stop後は生成途中ファイルが残る可能性をsystemログとUI警告に表示し、自動削除しない。
- VOICEVOX等の復旧ヒントはRendererがログ内容と終了状態から分類する。

## 性能・拡張境界

- 同時実行数1と1,000行バッファで、初期ローカルMVPの負荷を制限する。
- U4は将来 `CommandRequest` を同じ開始境界へ渡す。
- U7は成功したOperationと完了時刻を参照してPreview更新要否を判断する。
- Security、Resiliency、Property-Based Testing拡張は `aidlc-state.md` で無効のためN/A。


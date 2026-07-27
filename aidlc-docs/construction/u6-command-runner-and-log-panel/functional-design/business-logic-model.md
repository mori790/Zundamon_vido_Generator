# ビジネスロジックモデル: U6 コマンド実行とログパネル

## スコープ

U6は、保存済みのアクティブスクリプト `input/{videoId}.json` に対して、既存npmスクリプトをStudio GUIから実行するための操作モデルを定義する。

対象コマンド:

- Validate: `npm run validate -- {videoId}`
- Voice: `npm run voice -- {videoId}`
- Timeline: `npm run timeline -- {videoId}`
- Preview: `npm run preview -- {videoId}`
- Render: `npm run render -- {videoId}`

U6はU3と並列に進めるため、未保存または未適用のドラフトは実行対象にしない。ドラフト連携はU3/U4後の接続点として扱う。

## コマンド実行フロー

1. ユーザーがワークスペースでコマンドボタンを押す。
2. Rendererが現在の `videoId` とコマンド種別をCommand Runnerへ渡す。
3. Command Runnerが前提条件と競合状態を確認する。
4. Validate以外のコマンドでは、先にValidateを実行する。
5. Validateが成功した場合のみ、要求されたコマンドを実行する。
6. Electron main processが子プロセスをspawnする。
7. stdoutとstderrをログイベントとしてRendererへ送る。
8. プロセス終了時に終了コード、状態、終了時刻をOperationへ反映する。
9. UIは操作結果、ログ、再実行可能なアクションを表示する。

## 実行境界

Rendererは直接OSプロセスを起動しない。Electron main processが、許可されたコマンド種別だけを固定マッピングから実行する。

Rendererの責務:

- コマンド開始要求。
- 操作状態の表示。
- ログ表示。
- Stop要求。

Main processの責務:

- 許可されたコマンドへの変換。
- `npm run ... -- {videoId}` のspawn。
- stdout/stderr/exitイベントの発行。
- 実行中プロセスの追跡。
- Stop要求時のプロセス終了。

## コマンドライフサイクル

Operationは次の状態を持つ。

- `queued`: Validate前提実行などで待機中。
- `running`: 子プロセスが実行中。
- `stopping`: Stop要求を送った後、終了待ち。
- `succeeded`: 終了コード0で完了。
- `failed`: 終了コード0以外、起動失敗、または前提Validate失敗。
- `cancelled`: Stopにより終了した。

Validateを自動実行する場合、ユーザーが押したコマンドは親Operation、内部Validateは子Operationとして扱ってもよい。初期実装ではログ上で「事前Validate」と「本処理」を区切るだけでもよい。

## 同時実行モデル

U6はワークスペース単位で次の制御を行う。

- Voice、Timeline、Preview、Renderは互いに競合するため同時実行しない。
- Validateは他のコマンド実行中でも許可する。
- ただし、Validateの結果は実行中コマンドを中断しない。
- Stopは実行中Operationごとに操作できる。

## ログモデル

ログは現在のStudioセッション中だけメモリに保持する。

ログイベント:

- `stdout`: 標準出力。
- `stderr`: 標準エラー。
- `system`: GUI側で追加する開始、終了、キャンセル、前提チェックなどのメッセージ。

ログはOperation単位で保持し、ワークスペースを閉じるかユーザーがClearを押すと破棄できる。

## エラー復旧

Validation失敗:

- 該当ログと終了状態を表示する。
- 要求された後続コマンドは開始しない。

VOICEVOX未起動:

- VoiceまたはRenderで失敗ログとして表示する。
- ユーザーはVOICEVOXを起動して同じコマンドを再実行できる。

Remotion失敗:

- PreviewまたはRenderのstderrと終了コードを表示する。
- U8の最終互換性検証までは、出力ファイル検証をU6の必須責務にしない。

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown構文は見出しと箇条書きのみを使用している。

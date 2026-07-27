# ドメインエンティティ: U6 コマンド実行とログパネル

## CommandType

GUIから実行できる固定コマンド種別。

- `validate`
- `voice`
- `timeline`
- `preview`
- `render`

各CommandTypeは、表示名、説明、npm script名、許可フラグ、事前Validate要否を持つ。

## CommandRequest

RendererからCommand Runnerへ渡す実行要求。

- `commandType`: 実行するCommandType。
- `videoId`: 対象ワークスペースの動画ID。
- `options`: 許可されたコマンドオプション。
- `requestedAt`: ISO timestamp。

初期U6で想定するオプション:

- `verbose`: 詳細ログを出す。
- `force`: VoiceまたはRender経由の音声再生成で利用する余地を残す。
- `skipVoice`: Renderで既存CLI互換のために利用する余地を残す。

## Operation

1回のGUI操作または内部事前Validateを表す。

- `operationId`: 一意な操作ID。
- `commandType`: 実行対象。
- `videoId`: 対象動画ID。
- `status`: `queued`, `running`, `stopping`, `succeeded`, `failed`, `cancelled`。
- `startedAt`: 開始時刻。
- `endedAt`: 終了時刻。
- `exitCode`: 終了コード。未終了または起動失敗時はnull可。
- `pid`: 子プロセスID。起動前または起動失敗時はnull可。
- `logs`: OperationLogEntryの配列。
- `parentOperationId`: 事前Validateなど親子関係がある場合の親ID。

## OperationLogEntry

Operationに紐づくログ行。

- `logId`: 一意なログID。
- `operationId`: 対象Operation。
- `timestamp`: ISO timestamp。
- `stream`: `stdout`, `stderr`, `system`。
- `message`: 表示する本文。

## CommandResult

コマンド完了時の結果。

- `operationId`: 対象Operation。
- `status`: `succeeded`, `failed`, `cancelled`。
- `exitCode`: 終了コード。
- `summary`: UI表示用の短い結果。
- `completedAt`: ISO timestamp。

## CommandConflictState

ワークスペース内の実行可否を判定する状態。

- `blockingOperation`: 実行中のVoice、Timeline、Preview、Render Operation。
- `validateOperations`: 同時実行中のValidate Operation一覧。
- `disabledCommandTypes`: 現在押せないCommandType一覧。
- `reasonByCommandType`: 無効理由の表示文。

## CommandCatalog

固定コマンド定義。

- `validate`: `npm run validate -- {videoId}`。
- `voice`: `npm run voice -- {videoId}`。
- `timeline`: `npm run timeline -- {videoId}`。
- `preview`: `npm run preview -- {videoId}`。
- `render`: `npm run render -- {videoId}`。

CommandCatalogはmain process側で保持し、Rendererから任意コマンドを指定させない。

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown構文は見出しと箇条書きのみを使用している。

# Logical Components: U6 コマンド実行とログパネル

## Shared Contracts

`src/studio/shared/` に次の契約を置く。

- `CommandType`: validate、voice、timeline、preview、render。
- `CommandRequest`: operationId、videoId、command、options。
- `Operation`: command、phase、status、開始・終了時刻、失敗分類。
- `LogEntry`: operationId、連番、timestamp、source、text。
- IPC payload: start、stop、clear、snapshot、operation event、log event。

## Electron Main Process

### CommandCatalog

固定CommandTypeを既存npm scriptと引数配列へ変換する。任意コマンドや任意シェル引数は受け付けない。

### CommandRunner

- Workspace単位の競合制御を行う。
- Validate事前処理と本コマンドを同一Operationのフェーズとして起動する。
- stdoutとstderrをLogBufferへ転送する。
- 終了、起動失敗、StopをOperationStoreへ反映する。

### OperationStore

- 現在のOperationと終了状態を保持する。
- 不正な状態遷移を拒否する。
- Renderer再接続時にsnapshotを返す。

### LogBuffer

- Operationごとに最新1,000行を保持する。
- stdout、stderr、systemを連番付きで正規化する。
- Clear要求で対象Operationのログだけを消す。

### ProcessStopper

- npmを含む子プロセスツリーの終了を試みる。
- 10秒の猶予後に強制終了へ切り替える。
- 終了処理の結果をsystemログへ記録する。

## Preload Boundary

contextBridgeで次の狭いAPIだけを公開する。

- `startCommand(request)`
- `stopCommand(operationId)`
- `clearCommandLogs(operationId)`
- `getCommandSnapshot()`
- `onOperationChanged(listener)`
- `onCommandLog(listener)`

購読解除関数を返し、Rendererの再マウント時にリスナーを残さない。

## Renderer

### CommandClient

Preload APIを型付きで包み、利用不能時は明示的なエラーを返す。

### ProductionCommandPanel

- 5つの固定コマンド操作を表示する。
- 実行中は競合する開始操作を無効化する。
- 実行中または事前Validate中だけStopを有効化する。

### OperationStatusBar

Command、phase、status、経過時間、再実行可否を表示する。

### LogPanel

- Renderer側で短時間バッチ化して最大1,000行を表示する。
- 自動スクロールは利用者が末尾付近にいる場合だけ行う。
- stdout、stderr、systemを視覚的に区別する。
- Clear Logsは表示ログだけを消す。

### RecoveryHint

RendererがCommandType、終了状態、ログ内容からVOICEVOX未起動等のヒントを選ぶ。未知の失敗では一般的な再実行・ログ確認案内を表示する。

## 依存と将来連携

- U1のWorkspace videoIdとElectron IPC境界を再利用する。
- U3の未適用ドラフトは参照せず、保存済み `input/{videoId}.json` のみ実行対象にする。
- U4の承認済みCommand Proposalは将来CommandClientの同じ開始APIへ接続する。
- U7/U8はOperation成功状態とログを再利用する。


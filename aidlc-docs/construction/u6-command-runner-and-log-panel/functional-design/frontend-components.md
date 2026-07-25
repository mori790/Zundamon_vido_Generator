# フロントエンドコンポーネント: U6 コマンド実行とログパネル

## コンポーネント階層

- `WorkspaceShell`
- `ProductionCommandPanel`
- `CommandButtonGroup`
- `CommandButton`
- `OperationStatusBar`
- `RunningOperationList`
- `LogPanel`
- `LogStream`
- `LogToolbar`

U6は既存のWorkspace表示領域にProductionCommandPanelを追加する。CodexPanelは継続して右側または補助領域に残す。

## ProductionCommandPanel

ワークスペース内の生成操作をまとめるコンテナ。

Props:

- `workspace`: 現在のWorkspaceState。
- `commandClient`: Rendererからmain processへコマンド要求を送るクライアント。

State:

- `operations`: Operation一覧。
- `selectedOperationId`: ログ表示対象。
- `lastValidationStatus`: 最後のValidate結果。
- `commandConflictState`: 現在のボタン有効化状態。

責務:

- CommandButtonGroupを表示する。
- OperationStatusBarを表示する。
- LogPanelに選択中Operationのログを渡す。
- StopとClear Logsを扱う。

## CommandButtonGroup

表示するコマンドボタン:

- Validate。
- Voice。
- Timeline。
- Preview。
- Render。

各ボタンはアイコンと短いラベルを持つ。無効状態では理由をtooltipまたは補助テキストで示す。

## CommandButton

単一コマンドの起動ボタン。

Props:

- `commandType`。
- `disabled`。
- `disabledReason`。
- `running`。
- `onRun`。

動作:

- 押下時にCommandRequestを作成する。
- Voice、Timeline、Preview、RenderではUI上にも「事前Validate後に実行」と分かる状態を出す。

## OperationStatusBar

現在の実行状態を短く表示する。

表示内容:

- アイドル。
- Validate実行中。
- Voice実行中。
- Timeline実行中。
- Preview実行中。
- Render実行中。
- 成功。
- 失敗。
- キャンセル済み。

## RunningOperationList

実行中または直近のOperationを一覧表示する。

操作:

- Operation選択。
- Stop。
- 再実行。

Stopは実行中またはstopping状態のOperationだけに表示する。

## LogPanel

選択中Operationのログを表示する。

構成:

- LogToolbar。
- LogStream。

操作:

- stdout/stderr/systemの表示。
- 自動スクロール。
- ログクリア。
- セッション内ログの表示切り替え。

初期U6ではログの永続保存は行わない。

## WorkspaceShell統合

WorkspaceShellは、ワークスペース本文にProductionCommandPanelを追加する。

統合ルール:

- `workspace.videoId` をコマンド対象にする。
- `workspace.activeScript` がnullの場合、生成系コマンドは無効化する。
- U3ドラフト状態が存在してもU6は `input/{videoId}.json` のみ対象にする。

## 将来接続点

U4 Codex承認:

- Codexが「Validateを実行」「Voiceを実行」などの操作を提案した場合、承認後にCommandRequestへ変換する。

U7プレビュー:

- Previewコマンドの状態とログを、埋め込みプレビュー更新判断に利用する。

U8レンダー検証:

- Render完了後の出力パス確認とCLI互換性検証をU8で追加する。

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown構文は見出しと箇条書きのみを使用している。

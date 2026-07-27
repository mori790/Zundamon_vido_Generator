# U9 Real Codex App Server Integration - Requirements Questions

回答する選択肢の文字を各 `[Answer]:` の後へ記入してください。

## Question 1
Codex App Serverのtransportはどれを採用しますか？

A) Electron main processが `codex app-server` を子processとして起動し、stableなJSONL-over-stdioで接続する（推奨）

B) localhost WebSocketで接続する（現行公式仕様ではexperimentalかつunsupported）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 2
App Server processのlife cycleはどうしますか？

A) Electron起動中に必要時起動し、アプリ終了時に停止する（推奨）

B) ユーザーが外部で起動したApp Serverへ接続する

C) アプリ起動時に常時起動し、切断時は自動再起動する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 3
Codex認証はどの方式をU9の前提にしますか？

A) ローカルCodex CLIの既存ChatGPTログイン状態を使用し、未認証時は案内を表示する（推奨）

B) `CODEX_ACCESS_TOKEN` によるtrusted local authenticationのみを使用する

C) 既存ChatGPTログインを優先し、access tokenもfallbackとして許可する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 4
既存Mock接続はどう扱いますか？

A) 開発・障害診断用として明示的なMock modeを残し、defaultはRealにする（推奨）

B) Mockを削除し、Real接続だけにする

C) defaultはMockのまま、ユーザーがRealへ切り替える

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 5
会話threadの永続化範囲はどれですか？

A) WorkspaceごとにApp Server thread IDを保存し、再起動後にresumeする（推奨）

B) アプリ起動中だけ保持し、再起動時は新しいthreadを開始する

C) 複数threadの一覧、選択、archiveまでU9で実装する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 6
Codexへ渡す作業directoryと権限境界はどうしますか？

A) 選択中Workspaceをcwdとし、workspace-write sandboxと既存承認UIを必須にする（推奨）

B) 選択中Workspaceをcwdとし、read-onlyで提案だけを許可する

C) Codexのglobal default設定へ完全に委譲する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 7
App Serverから届くaction approval requestはどう扱いますか？

A) 現在の承認UIへ統合し、明示承認後だけcommandやfile changeを実行する（推奨）

B) U9ではchat streamingだけ実装し、tool/action requestは拒否する

C) Workspace内の変更は自動承認する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 8
Streaming表示のU9完了条件はどれですか？

A) Agent message delta、turn status、command/file-change progress、terminal errorを既存Codex panelへ表示する（推奨）

B) Agent message deltaとturn completionだけ表示する

C) 全App Server notificationをraw logとして表示する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 9
接続切断やApp Server異常終了時のbehaviorはどれですか？

A) 実行中turnを失敗表示し、bounded retry後にmanual reconnectを提供する（推奨）

B) 自動再接続を無期限に繰り返す

C) 即座にMock modeへ自動切替する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 10
U9でexperimental App Server APIを使用しますか？

A) 使用せずstable API surfaceだけに限定する（推奨）

B) 必要な機能に限り `experimentalApi` を有効化する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 11
Security Baseline extensionをU9へ適用しますか？

A) Yes - SECURITY rulesをblocking constraintsとして適用する（推奨）

B) No - Security Baselineを無効にする

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 12
Resiliency Baseline extensionをU9へ適用しますか？

A) Yes - directional resiliency practicesを適用する

B) No - Resiliency Baselineを無効にする（local MVP向け推奨）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 13
Property-Based Testing extensionをU9へ適用しますか？

A) Yes - 全PBT rulesを適用する

B) Partial - protocol parserとserialization round-tripだけへ適用する

C) No - example-based testsだけを使用する（推奨）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

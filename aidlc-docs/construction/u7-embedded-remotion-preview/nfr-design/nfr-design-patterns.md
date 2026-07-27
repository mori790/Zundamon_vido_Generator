# NFR Design Patterns: U7 Embedded Remotion Preview

## Lazy Player Loading

- Preview Panelを初めて開いたときに `@remotion/player` をdynamic importする。
- Player chunk読込中はloading textを表示する。
- Workspaceを開いただけではPlayer bundleを読まない。
- import失敗はPreview専用Error Boundaryのfallback stateへ変換する。

## Two-Stage Preview Data

Electron main processにvideoId-onlyの2段階APIを置く。

1. `checkPreview(videoId)` がsource timestamps、missing/stale artifacts、required operations、capacity warningを返す。
2. `loadPreview(videoId)` が既存schemaで検証済みのcomposition propsとsnapshotを返す。

Rendererはfilesystem pathを組み立てず、任意pathをIPCへ渡さない。

## Readiness State Machine

状態は `idle`、`checking`、`generating`、`loading`、`ready`、`stale`、`failed` とする。

- checkingでrequired operationsを決定する。
- generatingではU6 Voice、Timelineを順番に実行する。
- U6失敗時はfailedへ移り、U6 logsへの導線を表示する。
- load成功時だけreadyへ移る。
- source更新検出時はstaleを経てrefreshする。

## Latest-Queued Refresh

- 同じvideoIdでrefresh中に新しいrequestを受けた場合、実行中処理をcancelしない。
- pending flagを1つだけ保持し、現在のrefresh完了後に最新状態を1回再確認する。
- 中間requestをqueueへ蓄積しない。
- Workspace変更時は旧videoIdの結果を破棄する。

## Memory Lifecycle

- 現在のWorkspaceの最新PreviewSnapshotとcomposition propsだけをmemoryに保持する。
- videoId変更またはWorkspace closeでsnapshot、props、Player ref、listenersを解放する。
- disk cacheとvideoId別session cacheを追加しない。
- 1080p/30fps/30分を超える場合はcapacity warningを表示し、best effortで続行する。

## Error Isolation

- clarification answerにより、Preview専用Error Boundaryを採用する。
- Player render/import errorをWorkspace、draft editor、Codex、U6 panelから隔離する。
- fallback UIにRetryと「Remotion Studioで開く」を表示する。
- RetryはError Boundary keyを更新し、check/loadを最初から再実行する。
- Remotion Studio fallbackはU6 Preview commandを使用する。

## Workspace Preview Coordinator

- WorkspaceShell内のPreview CoordinatorがU3 ApplyとU6 operation eventsを購読する。
- U6 `voice` または `timeline` 成功時にrefresh requestを発行する。
- PreviewPanelとProductionCommandPanelはCoordinatorから必要なstate/callbackだけを受け取る。
- component unmount時にすべての購読を解除する。

## Test Pattern

- check/stale/capacity/refresh coalescingはpure logic test。
- Preview Panel state、accessible controls、Retry、fallbackはReact component test。
- Playerはdefault testsでmockする。
- 実映像、音声、fullscreen、5秒目標はElectron manual smoke test。

## Extension Compliance

- Security Baseline: N/A。無効。ただしvideoId-only IPCを維持する。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。


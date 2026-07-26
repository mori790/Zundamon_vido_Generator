# Logical Components: U7 Embedded Remotion Preview

## PreviewDataService

Electron main processでpreview sourceを扱う。

### Responsibilities

- videoIdを既存Workspace validationで検証する。
- script、manifest、timelineの存在と更新時刻を確認する。
- missing/stale artifactsとrequired operationsを返す。
- `buildRenderData(videoId)` を再利用してcomposition propsを構築する。
- schema-validated responseだけをRendererへ返す。

### API

- `checkPreview(videoId): Promise<PreviewReadiness>`
- `loadPreview(videoId): Promise<PreviewLoadResult>`

## Preview IPC Bridge

- Main handlersをPreload APIへ狭く公開する。
- Rendererから受け取る値はvideoIdだけ。
- arbitrary path、URL、commandを受け付けない。
- Workspace close時に追加listenerを残さない。

## Preview Coordinator

WorkspaceShellが所有するevent coordinator。

### Inputs

- U3 Apply success。
- U6 Voice/Timeline operation success。
- Preview open、manual refresh、retry。
- videoId change、Workspace close。

### Responsibilities

- refresh中かどうかとlatest pending requestを管理する。
- PreviewDataService check結果に従いU6 generationを開始する。
- PreviewPanelへreadiness、snapshot、props、errorを渡す。
- 旧videoIdから遅れて届いたresultを破棄する。

## PreviewPanel

- idle/checking/generating/loading/ready/stale/failedをtext表示する。
- 初回open時にEmbeddedPlayerをlazy loadする。
- loading中のcontrolsをdisableする。
- capacity warningとU6 failureを表示する。

## EmbeddedPlayer

- `@remotion/player` と既存 `ZundamonVideo` を使用する。
- snapshotのduration、fps、width、heightとcomposition propsを受け取る。
- Play/Pause、seek、volume、fullscreenを提供する。
- stable `data-testid`、accessible names、visible focusを持つ。

## PreviewErrorBoundary

- EmbeddedPlayer subtreeだけを囲む。
- import/render errorを捕捉する。
- Preview Panel内にerror、Retry、Remotion Studio fallbackを表示する。
- Workspace全体をunmountしない。

## U6 Integration

- Missing manifestはVoice、missing/stale timelineはTimelineを既存Command Clientへ要求する。
- fallbackはPreview operationを要求する。
- 同時実行、Stop、logs、failure classificationはU6を再利用する。
- Preview用process runnerを追加しない。

## State Ownership

- Preview Coordinator: readiness、refresh control、snapshot、props、error。
- PreviewPanel: open/closedとUI presentation。
- EmbeddedPlayer: playback frame、playing、volume、fullscreen。
- U6: production operationとlogs。

## Capacity and Cleanup

- 1 Workspaceにつき1 Player。
- 最新snapshotのみmemory保持。
- videoId change/unmountでPlayer、props、snapshot、subscriptionsを解放する。
- 1080p/30fps/30分超過はwarning stateで表す。

## Verification Boundary

- Unit tests: readiness、stale、capacity、latest-queued refresh。
- Component tests: state display、controls、keyboard labels、Retry、fallback。
- Integration tests: Coordinatorとmock U6/preview API。
- Manual: actual Remotion playback、audio、fullscreen、5秒startup target。

## Traceability

- US-15 AC1: PreviewDataServiceとEmbeddedPlayer。
- US-15 AC2: checkPreview、timestamps、Preview Coordinator。
- US-15 AC3: PreviewErrorBoundaryとU6 Preview fallback。


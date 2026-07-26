# Domain Entities: U7 Embedded Remotion Preview

## PreviewSource

- `videoId`
- `scriptPath`
- `manifestPath`
- `timelinePath`
- `scriptModifiedAt`
- `manifestModifiedAt`
- `timelineModifiedAt`

Apply済みpreview inputと更新時刻を表す。

## PreviewSnapshot

- `source`
- `loadedAt`
- `durationInFrames`
- `fps`
- `width`
- `height`

現在Playerへ読み込まれたdataの版を表す。

## PreviewReadiness

- `status`: `checking`、`generating`、`ready`、`stale`、`failed`
- `missing`: `manifest` または `timeline` の配列
- `stale`: `script`、`manifest`、`timeline` の配列
- `requiredOperations`: Voice、Timelineの順序付き配列
- `error`

Preview開始前の判定結果を表す。

## PreviewPlaybackState

- `playing`
- `frame`
- `volume`
- `fullscreen`

利用者のPlayer操作状態を表す。永続保存しない。

## PreviewLoadResult

- `status`: `loaded` または `failed`
- `snapshot`
- `props`
- `error`

Embedded previewへ渡すcomposition propsまたは失敗を表す。

## PreviewFallbackRequest

- `videoId`
- `command`: `preview`

U6 Command Runnerへ渡す固定fallback要求を表す。

## Relationships

- PreviewSourceからPreviewReadinessを判定する。
- ReadyなPreviewSourceからPreviewSnapshotとcomposition propsを作る。
- PreviewPlaybackStateは1つのPreviewSnapshotに属する。
- PreviewLoadResultがfailedの場合だけPreviewFallbackRequestを利用可能にする。


# Domain Entities: U8 Render Workflow and CLI Compatibility Verification

## RenderReadiness

- `videoId`
- `ready`
- `missing`: script、manifest、timeline
- `stale`: manifest、timeline
- `requiredOperations`: Voice、Timeline

U7のPreview readiness判定を再利用し、GUI Renderを開始できるか表す。

## RenderTarget

- `videoId`
- `outputPath`: `output/{videoId}.mp4`
- `exists`
- `overwriteApproved`

Canonical outputとGUI上書きgateを表す。任意pathは保持しない。

## RenderOperation

U6 `Operation` を再利用する。

- `id`
- `videoId`
- `command`: render
- `phase`
- `status`
- `startedAt`
- `endedAt`
- `failure`
- `error`

## RenderOutcome

- `status`: succeeded、failed、cancelled
- `outputPath`
- `operationId`
- `error`

成功時だけoutputPathを持つcurrent Workspaceの表示用resultで、永続化しない。

## CompatibilityCheck

- `videoId`: sample-video
- `command`: validate、voice、timeline、preview、render
- `status`: passed、failed、blocked
- `details`

GUI-created projectがexisting CLI commandで利用できることをverification summaryへ記録する。

## Relationships

- RenderReadinessがreadyの場合だけRenderTargetのoverwrite gateへ進む。
- RenderTargetが承認済みの場合だけRenderOperationを開始する。
- Terminal RenderOperationからRenderOutcomeを作る。
- CompatibilityCheckはRenderOutcomeと独立し、existing CLI contractの回帰を記録する。


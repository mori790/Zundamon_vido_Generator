# Code Summary: U7 Embedded Remotion Preview

## Outcome

U7はApply済みscript、voice manifest、timelineをElectron main processで確認し、公式 `@remotion/player` と既存 `ZundamonVideo` をGUI内で表示する。missing/stale artifactはU6 Voice、Timelineで順次生成し、U3 ApplyとU6成功イベントをlatest-queued refreshへ接続した。

## US-15 Acceptance Criteria

- **AC1**: `PreviewPanel` がreadyなcomposition propsをlazy-loaded Remotion Playerへ渡す。
- **AC2**: source更新時刻からmissing/staleを判定し、Voice、Timelineを必要順に実行して自動更新する。
- **AC3**: dataまたはPlayer failureをPreview内に隔離し、U6 Preview commandの「Remotion Studioで開く」を提供する。

## Main Changes

- `@remotion/player` 4.0.499をdirect dependency化。
- shared readiness、capacity warning、latest-queued runnerを追加。
- videoId-onlyのPreviewDataService、IPC、preload API、renderer clientを追加。
- Workspace-owned PreviewCoordinatorとPreviewPanelを追加。
- ProductionCommandPanelにterminal operationを待つ最小 `run` boundaryを追加。
- U3 Apply、U6 Voice/Timeline success、workspace cleanupを接続。

## Verification

- `npx tsc --noEmit`: passed。
- U7 targeted tests: 24 passed。
- Full default suite: 98 passed。
- `npm run studio:build`: passed。
- `git diff --check`: passed。
- Real sample smoke: 利用者確認済み。Player表示、音声、seek、volume、fullscreen、fallback、5秒以内の表示を確認した。

## Manual Smoke

1. VOICEVOXを起動する。
2. Studioで `sample-video` を開き、自動Voice/Timeline生成の成功を確認する。
3. Previewの「開く」を押し、5秒以内のPlayer表示を計測する。
4. Play/Pause、seek、volume、fullscreen、音声を確認する。
5. Player failure時の再試行と「Remotion Studioで開く」を確認する。

## Limitations

- 1 Workspaceにつき1 Player。
- draftはApplyするまでpreview対象外。
- filesystem watcher、polling、disk cache、multiple Playersは追加していない。
- 1080p、30fps、30分超過はwarning付きbest effort。

## Extension Rule Compliance

- Security Baseline: N/A。Extension Configurationで無効。videoId-only IPCとU6 allowlistは維持した。
- Resiliency Baseline: N/A。Extension Configurationで無効。
- Property-Based Testing: N/A。Extension Configurationで無効。

# Business Rules: U7 Embedded Remotion Preview

## Data Rules

- Preview対象はApply済み `input/{videoId}.json` のみ。
- 未Apply draftはpreview dataへ変換しない。
- script、manifest、timelineが揃うまでembedded previewを開始しない。
- 不足artifactはU6のallowlisted VoiceとTimeline操作だけで生成する。
- 任意コマンドや任意ファイルパスをPreview Panelから渡さない。

## Generation Rules

- manifest不足またはscriptより古い場合はVoiceを先に実行する。
- timeline不足、scriptより古い、またはmanifestより古い場合はTimelineを実行する。
- VoiceとTimelineはU6の単一実行制御に従う。
- 自動生成中は重複するPreview refreshを開始しない。
- 自動生成失敗時は処理を止め、失敗した段階を表示する。

## Stale Rules

- source fileの更新時刻が最後に読み込んだsnapshotより新しければstale。
- timestampを取得できない場合は安全側としてstaleとする。
- U3 Apply後は次回確認でscript timestampを再取得する。
- U6 Voice/Timeline成功後、開いているPreviewは自動更新する。
- 自動更新失敗時は直前の表示を残し、stale/error状態にする。

## Playback Rules

- Play、Pause、seek、volume、fullscreenを提供する。
- seek値は0から総frame数の範囲へ補正する。
- volume値は0から1の範囲へ補正する。
- Workspaceを閉じると再生を停止する。
- Preview再読み込み中は操作を一時無効化する。

## Fallback Rules

- Embedded preview失敗だけではRemotion Studioを自動起動しない。
- 利用者が「Remotion Studioで開く」を選択した場合のみU6 Preview commandを実行する。
- fallback実行中の状態とログはU6をsingle source of truthとする。
- fallback失敗時はU6ログへの導線を保持する。

## Extension Compliance

- Security Baseline: N/A。無効。ただしU6 allowlist境界を維持する。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。


# Business Logic Model: U7 Embedded Remotion Preview

## Scope

U7はApply済みのactive scriptと生成済みvoice manifest、timelineを読み込み、GUI内で `ZundamonVideo` をpreviewする。未Apply draftは対象にしない。

## Open Preview Flow

1. WorkspaceのvideoIdを受け取る。
2. active script、voice manifest、timelineの存在と更新時刻を確認する。
3. artifactが不足していればU6を通じて必要な処理を順番に実行する。
   - manifest不足: Voice。
   - timeline不足、またはVoiceを再生成した場合: Timeline。
4. 生成失敗時はU6ログと失敗状態を表示し、埋め込みPreviewを開始しない。
5. `buildRenderData(videoId)` 相当の境界からcomposition propsを取得する。
6. embedded previewを初期化し、再生、一時停止、シーク、音量、全画面操作を有効にする。

## Stale Detection

Preview snapshotはscript、manifest、timelineの最終更新時刻を保持する。

- いずれかのsource fileがsnapshotより新しい場合はstale。
- manifestがscriptより古い場合はVoiceを再生成する。
- timelineがscriptまたはmanifestより古い場合はTimelineを再生成する。
- U6 VoiceまたはTimeline成功後、Previewが開いていれば自動的にsourceを再評価して再読み込みする。
- 再読み込み中は現在frameを維持できる範囲で維持し、新しいdurationを超える場合は末尾へ補正する。

## Playback

- 初期状態は停止、frame 0、既定音量100%。
- Play、Pause、seek、volume、fullscreenを提供する。
- preview data更新時は同じvideoIdに限りPlayerを再初期化する。
- Workspace変更時は再生を停止し、前Workspaceのpreview stateを破棄する。

## Fallback

Embedded previewの初期化または再読み込みに失敗した場合:

1. Preview Panel内に失敗理由を表示する。
2. 「Remotion Studioで開く」操作を表示する。
3. 操作時はU6のPreview commandを使用する。
4. fallback起動結果とログはU6の既存Operation/Log Panelで確認する。

## Traceability

- US-15 AC1: valid render dataをembedded previewへ表示する。
- US-15 AC2: source更新時刻からstaleと必要な再生成処理を決定する。
- US-15 AC3: embedded preview失敗時にRemotion Studio fallbackを提供する。


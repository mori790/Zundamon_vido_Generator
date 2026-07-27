# Frontend Components: U7 Embedded Remotion Preview

## Component Hierarchy

- `WorkspaceShell`
  - `PreviewPanel`
    - `PreviewStatus`
    - `EmbeddedPreview`
    - `PreviewControls`
    - `PreviewError`
    - `PreviewFallbackAction`
  - U6 `ProductionCommandPanel`

## PreviewPanel

### Props

- `videoId`
- `activeScript`
- U6 operation state and command start boundary

### State

- readiness
- snapshot
- composition props
- playback state
- load error

### Behavior

- MountまたはvideoId変更時にreadinessを確認する。
- 不足artifactがあればU6 Voice、Timelineを必要順に実行する。
- U6 Voice/Timeline成功イベントを受けたら自動refreshする。
- embedded load失敗時にfallback actionを表示する。

## PreviewStatus

- checking、generating、ready、stale、failedを表示する。
- 自動生成中は現在のVoiceまたはTimeline段階を表示する。
- stale理由と不足artifactをテキストで表示する。

## EmbeddedPreview

- `ZundamonVideo` と読み込んだcomposition propsを表示する。
- snapshotのfps、duration、width、heightを使用する。
- 初期化失敗をPreviewPanelへ通知する。

## PreviewControls

- Play/Pause button。
- Seek slider。
- Volume control。
- Fullscreen button。
- loading/generating中は無効。
- stableな `data-testid` とaccessible labelを持つ。

## PreviewError

- 埋め込み初期化、artifact生成、data loadのどの段階で失敗したかを表示する。
- U6 command failureの場合はProductionCommandPanelのログ確認へ誘導する。

## PreviewFallbackAction

- Embedded preview失敗時だけ表示する。
- 「Remotion Studioで開く」でU6 Preview commandを開始する。
- 自動起動しない。

## Interaction Flows

### Normal

1. PreviewPanelがsourceを確認する。
2. 必要ならVoice、Timelineを自動生成する。
3. composition propsを読み込む。
4. EmbeddedPreviewを表示する。
5. 利用者が再生操作を行う。

### Refresh

1. U3 ApplyまたはU6生成後にsource timestampが変わる。
2. PreviewPanelがstaleを検出する。
3. 必要な生成を行い、自動再読み込みする。
4. frameを新しいduration内へ補正する。

### Fallback

1. EmbeddedPreview初期化が失敗する。
2. PreviewErrorとPreviewFallbackActionを表示する。
3. 利用者がfallbackを選ぶ。
4. U6 Preview commandを実行する。

## API Integration

- Preview source/read dataはElectronの狭いlocal preview APIを使用する。
- Voice、Timeline、fallback PreviewはU6 Command Clientを使用する。
- Rendererから任意filesystem pathやshell commandを渡さない。


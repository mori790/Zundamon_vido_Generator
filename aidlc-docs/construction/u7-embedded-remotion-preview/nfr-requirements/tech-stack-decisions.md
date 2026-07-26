# Tech Stack Decisions: U7 Embedded Remotion Preview

## Embedded Player

`@remotion/player` を直接dependencyとして使用する。

- 既存Remotion compositionをReact renderer内で再利用できる。
- Play/Pause、seek、volume、fullscreenの標準境界を利用できる。
- 独自frame schedulerとmedia synchronizationを実装しない。
- `remotion` と同じ解決versionへ揃え、version mismatchを避ける。

## Composition

既存 `ZundamonVideo` と `ZundamonCompositionProps` を再利用する。

- Remotion Studio、render、embedded previewでcompositionを共有する。
- U7専用compositionを作成しない。
- duration、fps、width、heightはPreviewSnapshotとpropsから渡す。

## Local Preview API

Electron側に狭いpreview data APIを設ける。

- Inputは検証済みvideoId。
- Outputはreadiness、source timestamps、または `ZundamonCompositionProps`。
- 既存 `buildRenderData(videoId)` とstore functionsを再利用する。
- RendererへNode filesystem APIを追加で公開しない。

## Stale Detection

Node.js filesystem metadataの更新時刻をevent-drivenに比較する。

- Preview open/refresh時に確認する。
- U3 Apply成功後とU6 Voice/Timeline成功後に再確認する。
- filesystem watcherとinterval pollingは採用しない。

## Command Integration

不足artifact生成とfallbackはU6 Command Clientを再利用する。

- Voice、Timeline、Previewのallowlisted operationだけを使用する。
- 新しいprocess runnerを作らない。
- U6 OperationとLogEntryを診断表示に再利用する。

## Testing

- Vitestでreadiness/stale純粋ロジックを検証する。
- React Testing LibraryでPreview Panelの状態、操作、fallbackを検証する。
- `@remotion/player` はUI testでmockし、重いmedia playbackをdefault testから外す。
- Electron上の実映像、音声、fullscreenはmanual smoke testとする。

## Rejected Alternatives

- Remotion Studio iframe: application lifecycleとfallbackの分離が曖昧になるため不採用。
- 独自Player: Remotion公式Playerが提供する同期処理を再実装するため不採用。
- filesystem watcher: event-driven確認で足りるMVPに常駐resourceと複雑性を追加するため不採用。
- 複数Player: ローカルMVPの要件になくmemory負荷を増やすため不採用。


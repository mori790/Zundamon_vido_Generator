# Integration Test Instructions

## Automated Boundaries

```bash
npm run test:integration
npm run test:studio:e2e
```

- `test:integration` は起動中のVOICEVOX Engineを検証する。
- `test:studio:e2e` はElectron main/preloadとasset file access boundaryを検証する。

## CLI Pipeline

```bash
npm run validate -- sample-video
npm run voice -- sample-video
npm run timeline -- sample-video
npm run preview -- sample-video
npm run render -- sample-video
```

Expected:

- WAVは `public/audio/sample-video/`、timelineは `generated/timelines/` に生成される。
- PreviewはRemotion Studioを起動してbuildを完了する。
- RenderはprogressとETAを出力し、`output/sample-video.mp4` をnon-zero fileとして検証する。

## GUI Workflow

1. `npm run studio:dev` と `npm run studio:start` を起動する。
2. Workspace、draft review、asset selection、Validate、Voice、Timeline、Previewを確認する。
3. Renderのoverwrite confirm/cancel、progress、ETA、Stop、partial warning、manual retry、Finder revealを確認する。
## U9 Codex App Server

- Run `npm run test:studio:e2e` to verify the context-isolated preload and purpose-specific local-file IPC.
- Start Studio, select Real, and verify initialize, thread start/resume, streamed response, Stop, reconnect, and new thread.
- Trigger a safe approval request and verify Approve, Deny, timeout, disconnect, and shutdown settle fail closed.
- Fault-inject malformed/oversized JSONL, process exit, pending capacity, and three reconnect failures; verify manual recovery without turn replay.

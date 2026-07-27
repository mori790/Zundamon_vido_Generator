# Integration Test Instructions

## Electron Boundary

```bash
npm run test:studio:e2e
```

context-isolated Preload、Workspace API、dependency degraded state、local file access、asset選択を確認する。期待値は`U5_ELECTRON_E2E_OK`とexit code 0である。

## CLI Pipeline

VOICEVOX Engineを起動した場合:

```bash
npm run test:integration
npm run validate -- sample-video
npm run voice -- sample-video
npm run timeline -- sample-video
npm run preview -- sample-video
npm run render -- sample-video
```

VOICEVOXなしのrender確認:

```bash
npm run test:render
```

期待結果はWAV、timeline、Preview、non-zero MP4、単調増加するprogress、最終100%である。

## Packaged Runtime

1. `npm run package`を実行する。
2. `.app`を起動し、Workspaceを選択する。
3. Validate、Timeline、Preview、Renderを実行する。
4. RendererがTypeScript source、dev server、repository cwdへ依存しないことを確認する。
5. Render後にFinder revealとMP4再生を確認する。

## Cleanup

Test用Workspaceだけを削除する。生成途中のMP4は障害調査に使うため自動削除しない。

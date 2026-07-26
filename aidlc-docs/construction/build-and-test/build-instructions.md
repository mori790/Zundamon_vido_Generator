# Build Instructions

## Prerequisites

- Node.js 20、npm。
- macOS。Electron、Remotion、native Finder revealの確認に使用する。
- VOICEVOX Engine 0.25系。voice生成とlive integrationで使用する。

## Build Steps

```bash
npm install
npx tsc --noEmit
npm run studio:build
```

## Expected Results

- TypeScriptがerrorなしで終了する。
- Electron Renderer buildが `dist-studio/` に生成される。
- Remotion CLIと関連packageは4.0.499、Zodは4.4.3に整合する。

## Runtime Commands

```bash
npm run studio:dev
npm run studio:start
npm run preview -- sample-video
npm run render -- sample-video
```

## Troubleshooting

- Previewの実行file解決に失敗する場合は `node_modules/.bin/remotion --version` を確認し、`npm install` を再実行する。
- `preview:check` handlerがない場合はElectron main processを完全終了して再起動する。
- VOICEVOX接続失敗時はEngineと `VOICEVOX_BASE_URL` を確認する。
- `npm audit fix --force` はbreaking change確認なしで実行しない。

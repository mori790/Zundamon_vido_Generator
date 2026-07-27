# Build Instructions

## Prerequisites

- macOS 13以降、Apple Silicon
- Node.js 20以降、npm 11系
- package取得とElectron初回取得用のnetwork
- 実音声test時のみVOICEVOX Engine 0.25系
- 実Codex test時のみCodex CLI 0.145.0以降とChatGPT login
- 一般配布時のみApple Developer署名identityとnotarytool Keychain profile

## Build Steps

```bash
npm ci
npx tsc --noEmit
npm run studio:build
npm run package
```

Local acceptance用のarm64 `.app`、ZIP、SBOM、checksum、manifestは次で生成する。

```bash
npm run release:local
```

一般配布用buildはApple credentialを設定したrelease担当者だけが実行する。

```bash
export APPLE_NOTARY_KEYCHAIN_PROFILE='<keychain profile name>'
npm run release:public
```

## Expected Output

- `dist-studio/`: Renderer、Main、Preload
- `dist-cli/`: production CLI
- `dist-remotion/`:事前生成Remotion bundle
- `out/Zundamon Video Generator-darwin-arm64/`: arm64 `.app`
- `out/make/zip/darwin/arm64/`: ZIP
- `out/release-sbom.cdx.json`: CycloneDX SBOM
- `out/release-manifest.json`: version、revision、SHA-256、release state

261 MiBの現行ZIPは200 MiB警告対象だが300 MiB遮断値未満である。未署名buildの正常な状態は`local-acceptance`であり、一般配布は禁止される。

## Troubleshooting

- GitHub取得失敗: networkを確認して`npm run package`を再実行する。
- Remotion binary失敗: `.app/Contents/Resources/app.asar.unpacked/node_modules/@remotion/compositor-darwin-arm64/`を確認する。
- `preview:check`未登録: Electron Mainを完全終了し、最新buildで再起動する。
- 署名失敗: credentialをlogへ貼らず、Keychain profileとApple Developer identityを確認する。
- 強制的な`npm audit fix --force`は実行しない。

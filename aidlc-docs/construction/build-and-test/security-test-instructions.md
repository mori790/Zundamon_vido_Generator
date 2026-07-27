# Security Test Instructions

## Automated Checks

```bash
npm audit --omit=dev --audit-level=high
npx tsc --noEmit
npm test
npm run verify:package
npm run verify:release
```

期待結果:

- production dependency vulnerabilitiesは0
- Workspace外pathと無効video IDは拒否
- RendererはNode builtin、raw Electron、child processへ直接accessしない
- `contextIsolation: true`、`nodeIntegration: false`
- secret／credentialをmanifest、log、packageへ含めない
- local packageは`local-acceptance`
- 未署名packageへの`verify:release`は非0でfail closed

## Artifact Review

```bash
codesign --verify --deep --strict 'out/Zundamon Video Generator-darwin-arm64/Zundamon Video Generator.app'
xcrun stapler validate 'out/Zundamon Video Generator-darwin-arm64/Zundamon Video Generator.app'
spctl --assess --type execute --verbose=2 'out/Zundamon Video Generator-darwin-arm64/Zundamon Video Generator.app'
shasum -a 256 out/make/zip/darwin/arm64/*.zip
```

一般配布では署名、公証ticket、staple、Gatekeeper、manifest SHA-256がすべて成功しなければならない。`com.apple.security.get-task-allow`は禁止する。

## Applicability

- SECURITY-05、09、10、12、13、15: applicable、検証対象
- SECURITY-01〜04、06〜08、11、14: network service、cloud IAM、authentication、central monitoringを持たないlocal desktop appのためN/A

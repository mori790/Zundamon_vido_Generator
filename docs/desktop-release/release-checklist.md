# Desktop Release Checklist

## Local Acceptance

- [ ] Clean installでtypecheck、default tests、PBT、Studio buildが成功する。
- [ ] `npm run release:local`がarm64 `.app`とZIPを生成する。
- [ ] Artifactは`local-acceptance`と表示され、一般配布禁止になる。
- [ ] SBOM、SHA-256、version、Git revision、architectureをmanifestで確認する。
- [ ] Secret、test、cache、source map、WorkspaceがAppへ含まれない。
- [ ] ZIP 200 MiB warning／300 MiB blockingを確認する。

## Credential取得後のPublic Release

- [ ] FileVaultを有効にしたrelease Macを使用する。
- [ ] Developer ID Application certificateを確認する。
- [ ] `APPLE_NOTARY_KEYCHAIN_PROFILE`を設定する。
- [ ] `npm run release:public`が成功する。
- [ ] Hardened Runtimeとsecure timestampを確認する。
- [ ] `com.apple.security.get-task-allow`がないことを確認する。
- [ ] codesign、stapler、Gatekeeper、ticket、checksumがすべて成功する。
- [ ] Manifest stateが`publishable`である。

## 新規macOS利用者プロファイル

- [ ] ZIPを展開して通常のGatekeeper確認後に起動できる。
- [ ] Workspace選択、必須directory作成、再起動復元が成功する。
- [ ] Codex未導入／version不足／未loginを区別できる。
- [ ] VOICEVOX未起動を案内できる。
- [ ] Script、asset、Validate、Preview、Render、Stop、Finder revealが動作する。
- [ ] 手動更新と既知正常versionへのRollbackでWorkspaceが維持される。

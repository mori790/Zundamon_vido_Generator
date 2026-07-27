# U10 Tech Stack Decisions

## 採用

| 領域 | 選択 | 理由 |
|---|---|---|
| Packaging | `@electron-forge/cli` 7.11.2 | 既存Electron projectへ標準的に追加できる |
| ZIP maker | `@electron-forge/maker-zip` 7.11.2 | U10のZIPだけという対象範囲を満たす |
| Signing | Forge `packagerConfig.osxSign` | Developer IDとHardened Runtimeをpackage stepへ統合する |
| Notarization | Forge `packagerConfig.osxNotarize` | `notarytool`を使いcredentialを環境またはKeychainから受ける |
| Production build | Existing Vite 6.4.3＋esbuild 0.28.1 | 新しいbundlerを追加せずMain／Preload／Rendererをbuildできる |
| Runtime validation | Existing Zod 4.4.3 | Workspace設定とmanifestのtrust boundary検証に再利用する |
| Example tests | Existing Vitest 4.1.10 | 現行test suiteと統合する |
| PBT | Existing fast-check 4.9.0 | Shrinkingとseed replayが既に利用可能 |
| Hash | Node `crypto` SHA-256 | 標準libraryで追加dependency不要 |
| File operations | Node `fs/promises` | Atomic rename、realpath、permission確認を標準libraryで行う |
| SBOM | `npm sbom --sbom-format cyclonedx` | npm標準機能で追加dependencyや独自変換を避ける |

Forgeはpackage stepでmacOS signing／notarizationを扱い、ZIP makerは`.app`を含むZIPを生成する。production bundlingはForgeが自動実行しないため、既存Vite／esbuildをpackage前hookから実行する。[Electron Forge build lifecycle](https://www.electronforge.io/core-concepts/build-lifecycle)、[macOS signing guide](https://www.electronforge.io/guides/code-signing/code-signing-macos)、[ZIP maker](https://www.electronforge.io/config/makers/zip)

## Credential方針

- 第一選択はmacOS Keychainの`notarytool` profile。
- CI releaseは対象外だが、環境変数方式も設定可能にする。
- Credential値をconfig、argv、manifest、logへ出さない。
- Credentialがなければnotarizationをskip成功にせず、local acceptanceとして明示する。

## 不採用

- **electron-builder**: Forge選択済みで重複するため不採用。
- **Forge Vite plugin**: 既存Vite／esbuild構成を置き換える価値がなく、移行範囲が増えるため不採用。
- **DMG／PKG maker**: U10対象外。
- **Auto updater／publisher**: 手動更新、local releaseの要件外。
- **Custom packaging framework**: ForgeとNode標準libraryで足りる。
- **Runtime Release service**: 配布credentialとbuild logicを通常アプリへ持ち込むため不採用。

## Version方針

- 新規Forge packageはexact `7.11.2`で追加する。
- 既存dependencyは現在のlockfileをrelease入力として固定する。
- Upgradeは別変更としてpackage、署名、公証、E2Eを再検証する。
- Alpha版Forge 8は採用しない。

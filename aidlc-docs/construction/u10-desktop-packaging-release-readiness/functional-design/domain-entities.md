# U10 Domain Entities

## WorkspaceReference

- `schemaVersion`
- `root`
- `savedAt`

保存対象。`root`は再検証前にはtrusted pathとして扱わない。

## WorkspaceState

- `status`: `unconfigured | validating | ready | invalid`
- `root`: Readyの場合だけ存在
- `reason`: `missing | denied | not-directory | unsafe | create-failed`

`WorkspaceReference`をruntime検証した結果であり、Main processが所有する。

## RequiredWorkspaceDirectory

- `input`
- `public`
- `generated`
- `output`

固定集合。既存directoryは保持し、不足分だけを作成する。

## DependencyStatus

- `dependency`: `codex | voicevox`
- `status`: `ready | missing | stopped | unsupported | unauthenticated | unreachable`
- `detectedVersion`
- `actionCode`
- `checkedAt`

表示文言ではなく安定したcodeを保持する。credentialは含まない。

## RuntimeResources

- `applicationRoot`
- `cliEntry`
- `remotionEntry`
- `publicRoot`

Packaged Resource Resolverだけが構築する読み取り専用path集合。

## ReleaseEvidence

- `signature`
- `notarization`
- `staple`
- `gatekeeper`
- `checksum`
- `manifest`
- `inclusionPolicy`

各要素は成功、失敗、未実行と検証時刻を持つ。

## ReleaseManifest

- `productName`
- `bundleId`
- `version`
- `gitRevision`
- `architecture`: `arm64`
- `artifacts`
- `sbom`
- `state`

secretやlocal absolute pathを含めない。

## ReleaseState

`local-acceptance | signed | notarized | verified | publishable`

前状態と必要証跡に基づく純粋関数だけで遷移する。

## 関係

- 1つの`WorkspaceReference`から起動ごとに1つの`WorkspaceState`を導出する。
- 1つの`WorkspaceState`が既存制作service群へ1つのrootを供給する。
- `DependencyStatus`はdependencyごとに独立して存在する。
- 1つのrelease候補に1つの`ReleaseManifest`と複数の`ReleaseEvidence`が対応する。

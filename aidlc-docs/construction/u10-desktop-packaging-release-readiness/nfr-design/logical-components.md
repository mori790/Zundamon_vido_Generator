# U10 Logical Components

## Runtime

### WorkspaceGuard

- `realpath`、directory、permission、allowlistを検証する。
- Workspace Service、local-file、Command Runner、Preview、Renderが共有する。
- Invalid resultはtyped reasonを返し、fallbackしない。

### AtomicJsonStore

- Workspace参照とrelease manifestのparse、schema validation、temporary write、renameを行う。
- Node `fs/promises`と既存Zodだけを使用する。

### DiagnosisCoordinator

- Codex adapterとVOICEVOX adapterを並列実行する。
- 独立timeoutと最新snapshotを管理する。
- 自動retry、queue、circuit breakerは持たない。

### PackagedRuntimeResolver

- `app.isPackaged`に応じてapplication resourceを解決する。
- WorkspaceGuardへ利用者root、Command Adapterへ読み取り専用entryを供給する。

### FirstRunGate

- Workspace状態を表示し、Readyまで既存Studioのmutation機能をmountしない。
- Dependency状態はdegraded表示に留め、無関係な機能をlockしない。

## Build and Release

### ProductionBuilder

- ViteでRenderer、esbuildでMain／PreloadをJavaScriptへbuildする。
- Forge package前hookから呼び、出力の存在を検証する。

### ForgeConfiguration

- Product identity、bundle ID、arm64、icon、resource allowlist、ZIP makerを定義する。
- Keychainまたは環境変数から署名・公証optionを構築する。
- Credential不足時は公開用makeを成功させない。

### ReleasePolicy

- Pure functionとしてartifact inclusion、manifest normalize、release stateを判定する。
- I/O、process、Electronへ依存しないためexample testとPBTから直接利用できる。

### ReleaseCommandAdapter

- Apple toolとnpm commandを固定executable／argvで実行する。
- Timeout、exit code、bounded outputを`ReleaseEvidence`へ変換する。
- Secretをredactし、未知outputを失敗にする。

### ArtifactInspector

- `.app`とZIPのfile allowlist、size、SHA-256、SBOM、manifestを検証する。
- `npm sbom --sbom-format cyclonedx`とNode `crypto`を使用する。

## Dependency Relationships

| Component | Depends On | Does Not Depend On |
|---|---|---|
| FirstRunGate | typed Preload API | Node、filesystem |
| WorkspaceGuard | `fs/promises` | Renderer |
| DiagnosisCoordinator | Codex／VOICEVOX adapters | Release logic |
| PackagedRuntimeResolver | Electron app metadata | User credential |
| ProductionBuilder | Vite、esbuild | Dev server runtime |
| ForgeConfiguration | Forge、Credential Provider | Renderer |
| ReleasePolicy | Domain types | Filesystem、process |
| ReleaseCommandAdapter | Child process wrapper | Electron Renderer |
| ArtifactInspector | npm、Node crypto、filesystem | Cloud service |

## 不要なComponent

- Queue、distributed cache、database、circuit breaker、background indexerは追加しない。
- Runtime Release service、generic IPC、custom crypto、custom SBOM generatorは追加しない。
- Auto updater、publisher、CI release coordinatorはU10対象外。

## Extension準拠

- **Security**: WorkspaceGuard、Credential Provider、ReleasePolicy、ArtifactInspectorで該当ruleを実装可能にした。阻害事項なし。
- **Resiliency**: Failure containment、atomic persistence、manual retry、rollbackをcomponentへ割り当てた。Cloud固有ruleは適用外。
- **PBT**: ReleasePolicyとpath／JSON normalizeをI/O非依存にし、model／oracle比較を可能にした。阻害事項なし。

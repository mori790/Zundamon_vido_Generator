# U10 Component Method設計

詳細な検証規則と状態遷移はFunctional Designで定義する。

## Workspace Service

- `get(): Promise<WorkspaceState>` — 保存済み参照を読み、再検証した状態を返す。
- `select(): Promise<WorkspaceState>` — native dialogでfolderを選択し、検証後に保存する。
- `clear(): Promise<void>` — 保存済み参照だけを削除する。
- `requireRoot(): Promise<string>` — 有効なcanonical rootを返し、無効ならtyped errorにする。

## Packaged Resource Resolver

- `resolveRuntime(): RuntimeResources` — Main、CLI、Remotion、public resourceの絶対pathを返す。
- `resolveWorkspacePath(root: string, relative: string): string` — root外を拒否してWorkspace pathを返す。
- `resolveResourcePath(relative: string): string` — allowlist内の読み取り専用resourceを返す。

## Dependency Diagnosis Service

- `checkCodex(): Promise<DependencyStatus>` — executable、version、login状態を分類する。
- `checkVoicevox(): Promise<DependencyStatus>` — 接続、version、engine状態を分類する。
- `checkAll(): Promise<DependencyReport>` — 両診断を独立実行して共通reportを返す。

## Packaged Command Adapter

- `createInvocation(request: StartCommandRequest): CommandInvocation` — 固定実行対象、引数、cwdを構築する。
- `assertAvailable(kind: CommandKind): Promise<void>` — commandに必要なresourceと依存を確認する。

## Release Module

- `createManifest(input: ReleaseInput): Promise<ReleaseManifest>` — version、revision、architecture、artifact、checksumを生成する。
- `classifyArtifact(evidence: ReleaseEvidence): ReleaseState` — 証跡から状態を純粋判定する。
- `verifyLocalAcceptance(input: ArtifactInput): Promise<VerificationResult>` — package内容、起動、checksumを検証する。
- `verifyPublishable(input: ArtifactInput): Promise<VerificationResult>` — 署名、公証、Gatekeeper、ticketを追加検証する。

## Preload API

- `workspaceApi.get(): Promise<WorkspaceState>`
- `workspaceApi.select(): Promise<WorkspaceState>`
- `workspaceApi.clear(): Promise<void>`
- `dependencyApi.checkAll(): Promise<DependencyReport>`

## 共有型

- `WorkspaceState`: `unconfigured | ready | missing | denied | invalid`
- `DependencyStatus`: dependency名、状態code、検出version、action code
- `ReleaseState`: `local-acceptance | signed | notarized | verified | publishable`
- すべての外部入力はruntime validation後にdomain型へ変換する。

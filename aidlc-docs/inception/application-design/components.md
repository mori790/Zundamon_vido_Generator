# U10 Component設計

## C1: Package Build Configuration

- **目的**: Main、Preload、Rendererをproduction JavaScriptへbuildし、arm64アプリとZIPを生成する。
- **責務**: package identity、entry、resource inclusion、icon、Forge maker、署名・公証hook。
- **境界**: Build時だけ使用し、通常runtimeへrelease credentialやbuild logicを持ち込まない。

## C2: Workspace Service

- **目的**: 利用者が選択したWorkspaceをMain processで安全に管理する。
- **責務**: native folder dialog、canonical path検証、構造確認、参照のatomic保存、起動時再検証。
- **境界**: Workspace内容は既存local-file serviceへ渡し、Rendererにはraw filesystem accessを公開しない。

## C3: Packaged Resource Resolver

- **目的**: 開発時とpackaged時の実行resourceを一箇所で解決する。
- **責務**: `app.isPackaged`に応じた読み取り専用resource root、CLI runtime、Remotion entry、public assetの解決。
- **境界**: 利用者Workspaceとapplication resourceを混在させない。

## C4: Dependency Diagnosis Service

- **目的**: Codex CLIとVOICEVOXの利用可能性を共通形式で返す。
- **責務**: 種類別adapterの呼出し、未導入／未起動／version不足／未loginの分類、復旧codeの返却。
- **境界**: token、login情報、不要な内部pathを返さない。

## C5: Packaged Command Adapter

- **目的**: 既存`CommandRunner`を選択済みWorkspaceとpackaged resourceへ接続する。
- **責務**: 固定command、検証済み引数、cwd、resource entryの提供。
- **境界**: shell文字列連結を行わず、既存CLIのrepository cwd動作を変えない。

## C6: Release Module

- **目的**: 成果物metadataと配布可否を決定的に検証する。
- **責務**: manifest、SHA-256、SBOM、inclusion policy、release state、codesign／Gatekeeper／ticket検証。
- **境界**: Build scriptからだけ利用し、通常アプリruntimeやRendererへ公開しない。

## C7: Purpose-Specific Preload APIs

- **目的**: Workspaceと依存診断の最小機能だけをRendererへ公開する。
- **責務**: typed request／response、IPC channel固定、Main handlerへの転送。
- **境界**: 汎用invoke、Node API、任意path APIを公開しない。

## C8: First-Run Renderer

- **目的**: 初回Workspace選択と依存診断結果を日本語で案内する。
- **責務**: 選択要求、状態表示、再選択、復旧手順への導線。
- **境界**: path検証やprocess実行を行わない。

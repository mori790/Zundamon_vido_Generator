# U10 Application Design

## 概要

U10は既存ElectronのMain／Preload／Renderer境界を維持し、Main側へWorkspace Service、Resource Resolver、Dependency Diagnosis、Packaged Command Adapterを追加する。配布処理はBuild Script、Forge Configuration、Release Moduleへ限定し、通常runtimeから隔離する。

## 採用した判断

- Workspace選択・検証・復元を1つのMain serviceへ集約する。
- CodexとVOICEVOXは1つの診断serviceから種類別adapterとして呼ぶ。
- Release logicはbuild scriptと純粋moduleへ限定する。
- Rendererには目的別typed preload APIだけを公開する。
- 既存Command Runner、local-file、Preview、Render、Codex serviceを再利用する。

## 成果物

- [components.md](components.md): 8 componentの目的、責務、境界
- [component-methods.md](component-methods.md): 高水準method signatureと共有型
- [services.md](services.md): Workspace、診断、packaged command、release orchestration
- [component-dependency.md](component-dependency.md): dependency matrixとdata flow

## 設計制約

- Workspace、resource、`userData`を別trust boundaryとして扱う。
- RendererへNode、filesystem、汎用IPCを公開しない。
- shell文字列連結とcredential保存を行わない。
- 未署名成果物をpublishableへ昇格させない。
- 無効Workspace、公証失敗、証跡不足ではfail closedにする。

## Extension準拠

- **Security Baseline**: Main ownership、typed IPC、path allowlist、credential隔離、署名・公証、fail-closedを設計へ反映。Cloud固有規則は適用外。阻害事項なし。
- **Resiliency Baseline**: dependency単位の失敗分離、Workspace再選択、rollback、cleanupを反映。Cloud HA／DRは適用外。阻害事項なし。
- **Property-Based Testing**: Workspace path、設定、manifest、release stateの純粋境界をテスト可能にした。阻害事項なし。

# U11 技術スタック決定

## 前提

U11は既存のTypeScript/Electron/React/Remotion/npm構成を維持する。新しいruntime framework、database、cloud service、CI/CD基盤、installer、auto updaterは追加しない。

## 採用する既存技術

| 領域 | 技術 | 決定 | 理由 |
|---|---|---|---|
| 言語 | TypeScript | 継続 | 既存CLI、shared contracts、testsと整合する。 |
| 実行 | Node.js 20以上 | 継続 | 既存`engines`と一致する。 |
| CLI実行 | `tsx` | 継続 | 既存scriptsと同じ実行方式でpreflight wrapperを追加できる。 |
| package scripts | npm scripts | 継続 | U11要件の「1つのnpm command」に合う。 |
| Desktop build | Vite + esbuild + Electron Forge | 継続 | 既存`studio:build`、`make`、`release:local`と整合する。 |
| Release evidence | 既存release manifest、SBOM、SHA-256、release-state contracts | 継続・再利用 | `local-acceptance`と`publishable`の判定ずれを避ける。 |
| Test runner | Vitest | 継続 | 既存test suiteと統合できる。 |
| PBT | fast-check | 継続 | 既存dependencyとPBT scriptsが存在し、shrinkingとseed replayに対応する。 |
| Schema validation | Zodまたは既存shared validation | 継続 | bounded parsingと既存contracts再利用に適する。 |

## 追加予定

| 項目 | 決定 | 備考 |
|---|---|---|
| npm script | `acceptance:preflight`を追加予定 | 名前はCode Generation計画で最終確認する。 |
| TypeScript script | `scripts/acceptance-preflight.ts`相当を追加予定 | 薄いwrapperとして実装し、release evidence logicを再利用する。 |
| Docs directory | `docs/internal-acceptance/`を追加予定 | checklistとevidence templateを配置する。 |
| Planning docs directory | `docs/post-mvp/`を追加予定 | backlog、roadmap、top-three specsを配置する。 |

## 追加しないもの

| 項目 | 理由 |
|---|---|
| 新しいdatabase | U11は文書とlocal preflightだけで永続data modelを実装しない。 |
| Cloud storage / monitoring | ローカルmacOS appで、cloud topologyはFuture扱い。 |
| CI/CD pipeline | ユーザー回答によりlocal npm commandとchecklistを採用。 |
| New PBT framework | fast-checkが既に導入済みで要件を満たす。 |
| Installer / auto updater | Future候補でありU11 scope外。 |
| Runtime UI library追加 | U11ではElectron Renderer runtime UIを変更しない。 |

## Preflight gate構成

| Gate | 使用技術 | 成功条件 |
|---|---|---|
| Artifact presence | Node filesystem API | arm64 ZIP、manifest、SBOMが存在する。 |
| Checksum | Node cryptoまたは既存release verifier | ZIP SHA-256がmanifestと一致する。 |
| Architecture | Existing manifest/release evidence | architectureが`arm64`。 |
| Release state | Existing release contracts | stateが`local-acceptance`。 |
| Production audit | npm audit | production dependency auditが成功する。 |
| Typecheck | npm script | TypeScript検証が成功する。 |
| Default tests | npm script | default Vitest suiteが成功する。 |
| Studio build | npm script | `studio:build`が成功する。 |

## PBT方針

- fast-checkを継続採用する。
- U11で新規pure helperを作る場合だけPartial PBTを必須にする。
- 対象候補は次の通り。
  - release state summaryが`local-acceptance`から`publishable`へ昇格しないproperty。
  - evidence path sanitizerがtoken、credential、個人情報、不要な絶対pathを出さないproperty。
  - future specに記載するseries/template/workspace referenceのround-tripとinvariant。
- 重要failure pathはexample testで固定する。
- PBT failure時はseed replayとshrinkingを維持する。

## Security判断

- Lockfileを維持する。
- production dependency auditをpreflight必須gateにする。
- SBOMとSHA-256をrelease evidenceとして扱う。
- reportとtemplateは秘匿情報を出さない。
- public distribution判定はU11 preflightの目的ではないため、`publishable`とは表示しない。

## Resiliency判断

- local direct/in-place deploymentを維持する。
- rollbackは直前の既知正常ZIPまたは`.app`への置換とし、Workspaceを維持する。
- preflightは自動artifact生成をしない。
- 失敗時はaction guidanceを表示し、利用者が修正後に再実行する。
- Clean-profile acceptanceは実行されるまでNot Runのまま扱う。

## Extension準拠

| Extension | 状態 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | lockfile、audit、SBOM、checksum、release-state separation、secret-safe outputを採用。Cloud/network/authはN/A。 |
| Resiliency Baseline | Compliant | local rollback、manual backup前提、direct/in-place deployment、rerunnable preflightを採用。Cloud HAはN/A。 |
| Property-Based Testing (Partial) | Compliant | fast-checkを継続し、PBT-02、03、07、08、09を新規pure logicに限定して適用。 |

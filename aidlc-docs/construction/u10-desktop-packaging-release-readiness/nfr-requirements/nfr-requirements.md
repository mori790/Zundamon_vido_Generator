# U10 NFR Requirements

## Performance

- **NFR-P1**: 新規macOS利用者プロファイルで、process起動からFirst Run UI表示までp95 5秒以内。
- **NFR-P2**: 1,000 file以下の通常Workspaceで、検証開始からReady表示までp95 2秒以内。
- **NFR-P3**: Codex診断は5秒、VOICEVOX診断は3秒で独立timeoutする。
- **NFR-P4**: arm64 ZIPは200 MiB超でwarning、300 MiB超でrelease blockingとする。
- **NFR-P5**: 計測は同一Apple Silicon Macで5回以上行い、cold startとwarm startを区別して記録する。

## Capacity and Scalability

- 単一利用者、単一local Workspace、1回に1つのproduction commandを前提とする。
- Workspace root検証は全file走査せず、必須4 directoryと必要な対象pathだけを検証する。
- Cloud scaling、multi-user concurrency、horizontal scalingは適用外。

## Security and Privacy

- Rendererは`contextIsolation: true`、`nodeIntegration: false`を維持し、目的別typed IPCだけを使う。
- Workspace、resource、`userData`のcanonical path境界を検証し、symlinkを含むroot逸脱を拒否する。
- Shell文字列連結を禁止し、固定executableとargvを使用する。
- CSPは不要な外部content、inline script、`unsafe-eval`を許可しない。
- Apple credential、Codex token／login情報、Workspace内容をsource、artifact、manifest、通常logへ保存しない。
- Build MacとWorkspace保存先ではFileVaultなどOS管理の保存時暗号化を使用する。
- 公証、dependency取得、artifact配布はTLS 1.2以上を使用する。
- Production dependencyのhigh／critical脆弱性をrelease blockingとする。
- Developer ID、Hardened Runtime、secure timestamp、最小entitlementsを使用し、`get-task-allow`を禁止する。
- 未署名、未公証、証跡不足のartifactをpublishableにしない。

## Reliability and Recovery

- CriticalityはLow。Cloud SLA、regional DR、multi-zoneは適用外。
- Workspace参照の保存はatomicとし、破損時は再選択へfail closedする。
- Workspace選択の途中失敗では新規作成分とtemporary fileをcleanupする。
- Dependency timeoutは対象機能だけを停止し、無関係な制作機能を維持する。
- Build、公証、検証失敗は非ゼロ終了し、途中成果物を公開用場所へ移さない。
- 既知正常な署名・公証済み旧versionへ手動rollbackでき、Workspaceを変更しない。
- Fault injectionはWorkspace消失、権限拒否、Codex timeout、VOICEVOX timeout、codesign／notary failure、checksum mismatchを含む。

## Maintainability and Reproducibility

- Node／npm lockfile、exact Forge 7.11.2、maker-zip 7.11.2、Electron 41.7.1を使用する。
- Existing Vite 6.4.3、esbuild 0.28.1、Vitest 4.1.10、fast-check 4.9.0を再利用する。
- Main／Preload／RendererをJavaScriptへ事前buildし、runtime TypeScript変換を禁止する。
- Manifestへversion、Git revision、architecture、checksum、SBOM、verification stateを記録する。
- Release commandは失敗理由と復旧actionを日本語で出力する。

## Testability

- 通常testでは各propertyを100 run、release gateでは1,000 run実行する。
- PBT失敗時はfast-check seed、path、縮小後の反例を保存する。
- Path、Workspace設定、manifest normalize、release state、inclusion policyをproperty対象とする。
- 各重要経路に具体例testも用意する。
- Package smoke、context-isolated Electron E2E、新規macOS利用者プロファイルchecklistを実施する。

## Usability and Accessibility

- 対応OSはApple Silicon上のmacOS 13 Ventura以降。
- First Run、依存不足、権限不足、release failureを日本語のactionable messageで示す。
- Setup viewはkeyboardのみで操作でき、focus管理、accessible name、live regionを備える。
- 通常利用者へstack trace、credential、不要な内部pathを表示しない。

## Extension準拠

### Security Baseline

- **準拠**: SECURITY-01、05、09、10、11、13、15。保存時暗号化、TLS、入力／path検証、hardening、lock／audit／SBOM、署名／checksum、fail-closedを定量化した。
- **適用外**: SECURITY-02〜04、06〜08、12、14。Cloud network、HTTP service、IAM、multi-user authentication、centralized monitoringを持たない。
- **阻害事項**: なし。

### Resiliency Baseline

- **準拠**: RESILIENCY-01〜04、10、14、15。Low criticality、Workspace保護、変更追跡、rollback、dependency障害、recovery、fault injectionを要求した。
- **適用外**: RESILIENCY-05〜09、11〜13。Cloud topology、managed datastore、regional failoverを持たない。
- **阻害事項**: なし。

### Property-Based Testing

- **準拠**: PBT-01〜10。Property、generator境界、oracle、shrinking、seed replay、具体例併用、通常100／release 1,000 runを要求した。
- **阻害事項**: なし。

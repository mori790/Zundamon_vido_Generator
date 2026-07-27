# NFR Requirements: U9 Real Codex App Server Integration

## Performance and Capacity

- App Server process start timeout: 5 seconds。
- Initialize handshake timeout: 10 seconds。
- Turn timeout: 10 minutes。User Stopを常時提供する。
- JSONL input limit: 1 MiB per line。
- User prompt limit: 64 KiB。
- Assistant item limit: 1 MiB。
- Pending correlated requests limit: 128。
- Pending approval timeout: 5 minutes、terminal decisionはdeny。
- Diagnostic log capacity: in-memory 2,000 entries。

## Reliability

- Unexpected process exit後は最大3回retryする。
- Retry delayは500 ms、1 second、2 seconds。
- Retry exhausted後はautomatic retryを停止し、manual reconnectを提供する。
- App Server failureはnon-Codex Studio featuresへ波及させない。
- Active turnとpending approvalはprocess exit、disconnect、shutdownでterminal化する。
- Unbounded queue、wait、line、history、retryは禁止する。

## Availability and Recovery

- Workload criticality: Low、local personal tool。
- Formal SLA、cross-region DR、multi-zone、auto-scaling: N/A。
- Rollback: previous known-good Git revision and lockfile。
- Workspace/session data recovery: normal local backup。
- Deployment: direct local update after typecheck、tests、build gate。

## Security

- Electronはcontext isolationを有効、Node integrationを無効にする。
- Rendererへpurpose-specific typed Context Bridge APIだけを公開する。
- App Serverはmain processがshellなしで起動する。
- Existing Codex loginを使用し、GUIはcredentialを収集・保存しない。
- All IPC/protocol/persistence inputs use bounded runtime validation。
- Approval、unknown request、timeout、disconnectはfail closed。
- Diagnostic logはprompt、assistant content、credential、raw approval payloadを保存しない。

## Supply Chain Gate

- `npm audit`をBuild & Testで実行する。
- Production dependencyのhigh/critical findingは、upgradeによる解消またはdocumented non-reachability evidenceがない限りblocking。
- Lockfileを維持し、新規dependencyはofficial npm registryのexact versionを使用する。
- Current baseline on 2026-07-26:
  - Critical: 1 (`vitest`, development tooling)。
  - High: 2 (`electron`, `vite` dependency chains)。
  - Moderate: 3。
- U9 Code GenerationはElectron、Vite、Vitest upgrade compatibilityを検証する。
- Build completion時に最新audit resultを再評価する。

## Compatibility

- Minimum Codex CLI: 0.145.0。
- Startup時にversionとstable handshake capabilityをprobeする。
- Unsupported version/capabilityはprocess execution前にactionable errorとする。
- Stable stdio only。Experimental APIs、WebSocket、generated experimental bindingsは使用しない。
- Stable protocol subsetはlocal runtime schemaで検証する。

## Maintainability and Testability

- Protocol codec、request correlator、approval controller、turn reducerをUI/process I/Oから分離する。
- Example-based testsはcritical user pathsを固定する。
- Full PBTはround-trip、bounds、correlation、state transition、orderingを検証する。
- PBT failureはseedとshrunk counterexampleを出力し、replay可能にする。
- PBT-discovered defectはexample regression testへ追加する。

## Usability and Accessibility

- Connection sourceはReal/Mockをtextで明示する。
- Streaming statusはcolorだけに依存しない。
- Live regionはtokenごとではなくbounded updateで通知する。
- Install、auth、resume、protocol、timeout failureごとにactionable recoveryを提供する。
- Active turn中はSend disabled、Stop available。

## Extension Compliance

### Security

- **Compliant requirements**: SECURITY-03、05、06、08〜13、15。
- **SECURITY-10**: Scanner baseline、blocking policy、upgrade verificationを定義した。Current findingsはCode Generation/Build gateで解消またはevidence化する。
- **N/A**: SECURITY-01、02、04、07、14。
- **Blocking findings at NFR Requirements**: なし。

### Resiliency

- **Compliant**: RESILIENCY-01〜04、10、15。
- **N/A**: RESILIENCY-05〜09、11〜14。Local non-deployed toolのため。
- **Blocking findings**: なし。

### Property-Based Testing

- **PBT-09 compliant by decision**: `fast-check` selected for Vitest integration、shrinking、seed reproduction。
- **PBT-01 traceability**: Functional Design properties carried forward。
- **PBT-02〜08、10**: Code Generation and Buildでenforce。
- **Blocking findings**: なし。

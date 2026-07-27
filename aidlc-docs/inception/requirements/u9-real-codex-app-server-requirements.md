# Requirements: U9 Real Codex App Server Integration

## Intent Analysis

- **User Request**: U9として現在のMock Codex connectionを実Codex App Server接続へ拡張する。
- **Request Type**: Existing user-facing featureのintegration enhancement。
- **Scope Estimate**: Electron main process、preload IPC、renderer Codex panel、local persistence、testsにまたがるmultiple-component change。
- **Complexity Estimate**: Complex。Authentication、bidirectional protocol、streaming、approval、subprocess lifecycle、local file mutation権限を扱う。
- **Existing Story Mapping**: US-3、US-4、US-5、US-8を再利用する。新規personaやjourneyは不要。

## Current Context

- U2は `CodexConnection` boundary、Mock mode、connection state、chat historyを実装済み。
- U4はCodex proposalと明示承認flowを実装済み。
- U6はallowlisted command execution、operation status、logs、Stopを実装済み。
- U9はこれらを置換せず、real connection adapterを追加して既存boundaryへ接続する。
- 現行公式App Serverはrich client向けのJSON-RPC型protocolを提供し、stable transportはJSONL-over-stdioである。

## Functional Requirements

### U9-FR-1: Real Connection as Default

- Codex panelのdefault connection modeをRealにする。
- Mock modeは開発・障害診断用として明示的に選択可能なまま残す。
- Real接続失敗時に自動でMockへ切り替えず、sourceを誤認させない。

### U9-FR-2: Main-Process-Owned App Server

- Electron main processが必要時に `codex app-server` をshellなしの子processとして起動する。
- App ServerとはJSONL-over-stdioで通信する。
- Rendererへprocess handle、stdin、stdout、credentialを公開しない。
- アプリ終了時は起動したApp Serverを停止し、stream readerとpending requestを解放する。

### U9-FR-3: Stable Protocol Lifecycle

- Connectionごとに `initialize` requestと`initialized` notificationを順序どおり送信する。
- 新規conversationは `thread/start`、既存conversationは `thread/resume` を使用する。
- User promptは `turn/start` で送信する。
- `turn/completed` またはterminal failureまでstable notificationを処理する。
- U9では `experimentalApi` を有効化せず、experimental methodやfieldを使用しない。

### U9-FR-4: Existing Codex Authentication

- ローカルCodex CLIの既存ChatGPT login stateを使用する。
- GUIはpassword、access token、API keyを収集または保存しない。
- 未認証、Codex executable不在、login期限切れを区別できるactionable errorとして表示する。
- Authentication失敗時もscript、draft、asset、CLI production機能は利用可能に保つ。

### U9-FR-5: Workspace-Scoped Thread Persistence

- WorkspaceごとにApp Server thread IDをlocal Studio stateへ保存する。
- アプリ再起動後は保存済みthreadをresumeする。
- Resume対象が存在しない、archived、またはinvalidな場合は明示表示後にnew threadを開始可能にする。
- U9では複数threadの一覧、選択、fork、archive UIを実装しない。

### U9-FR-6: Workspace and Sandbox Boundary

- `turn/start` のcwdは選択中Workspaceのcanonical rootに固定する。
- Sandboxはworkspace-writeを要求する。
- Rendererからarbitrary cwd、executable、sandbox bypassを指定できない。
- Workspace切替時は以前のWorkspace threadへpromptを送らない。

### U9-FR-7: Approval Integration

- App Serverのcommand execution、file changeその他のapproval requestを既存承認UIへ統合する。
- ユーザーの明示承認前にmutationを許可しない。
- Deny、cancel、timeout、UI破棄時はfail closedにする。
- Approval表示はoperation、対象、risk-relevant scopeをユーザーが判断できる内容にする。

### U9-FR-8: Streamed User Experience

- Agent message deltaを既存assistant messageへincremental表示する。
- Turn status、command progress、file-change progress、terminal resultを既存Codex panelに表示する。
- Notification順序の違い、未知のstable notification、malformed messageでRendererをcrashさせない。
- Raw protocol messageやcredentialを通常UIへ表示しない。

### U9-FR-9: Failure and Reconnection

- App Server異常終了、broken pipe、malformed JSON、request timeoutをterminal connection errorとして表示する。
- Retryは有限回、backoff付きで行い、上限到達後はmanual reconnectを提供する。
- In-flight turnが確定できない場合は成功扱いせず、failed/interruptedとして表示する。
- Reconnect後はprotocol initializationを新しいconnection上で再実行する。

### U9-FR-10: Compatibility

- Existing Mock tests、chat history、draft review、proposal approval、Command Runner、Preview、Renderを維持する。
- Existing CLI video workflowとcanonical file pathsを変更しない。
- App Server protocol typesは実行対象Codex CLI versionに対応するschemaから生成または検証可能にする。

## Non-Functional Requirements

### U9-NFR-1: Security

- 全App Server messageをruntime schemaでtype、length、collection size、identifier formatまで検証する。
- Protocol dataをOS command文字列へ連結しない。
- App Server subprocessはshellを使用せず、最小environmentで起動する。
- Token、credential、promptの機密内容をapplication logsへ出力しない。
- Renderer accessはnarrow typed IPC allowlistに限定する。
- Error messageは内部credential、stack、unnecessary absolute pathを露出しない。

### U9-NFR-2: Resiliency

- Local personal toolとしてworkload criticalityはLowとする。
- Cross-region DR、SLA、multi-zone、auto-scalingはN/Aとする。
- Workspace filesとthread stateの保護は通常のlocal backupへ委ねる。
- External process request、initialization、turn completionに明示timeoutを設定する。
- Retry count、pending requests、buffered line sizeに上限を設ける。
- Degraded modeではnon-Codex GUI機能と明示Mock modeを利用可能にする。

### U9-NFR-3: Change and Recovery

- Formal change managementは免除し、Git historyとAI-DLC approval gateを変更記録にする。
- CI/CDは追加せず、existing local npm typecheck、tests、buildを必須gateにする。
- Rollbackはprevious known-good Git revisionとlockfileで行う。
- Deploymentはdirect local updateとし、起動前にbuild/test成功を要求する。
- Incidentはlocal logs、再現手順、issue記録、regression testで追跡する。

### U9-NFR-4: Performance and Responsiveness

- Protocol parsingとevent deliveryはElectron Rendererをblockしない。
- Agent deltaは視認可能なstreamingを保ちつつ、過剰renderを避けるためbounded batching可能とする。
- Conversation historyとprotocol bufferに明示的なlocal capacity limitを設定する。

### U9-NFR-5: Testability and Property-Based Testing

- TypeScript PBT frameworkとしてVitestと統合でき、shrinkingとseed reproductionを提供するframeworkをNFR Requirementsで選定する。
- JSONL serialize/parseはround-trip propertyを持つ。
- Request ID correlationはresponse順序に依存せず、各pending requestが高々1回terminalになるinvariantを持つ。
- Thread/turn state machineはinvalid transitionを成功扱いしないstateful propertyを持つ。
- Size、identifier、message validationは定義range外を常に拒否するpropertyを持つ。
- Critical pathはPBTだけでなくexample-based regression testsも持つ。

## Resiliency Decisions

- **RTO/RPO and DR**: N/A。Local personal toolでcross-region DRなし。
- **Change Management**: Formal exemption。Git historyとAI-DLC approval gateを使用。
- **CI/CD**: U9では追加しない。Existing local npm verificationを使用。
- **Rollback**: Previous known-good Git revisionとlockfile。
- **Deployment Style**: Direct local update with pre-start build/test gate。
- **Regional Topology**: N/A。Local macOS processのみ。
- **Incident Response**: Local logs、reproduction、issue record、regression testによるlightweight process。

## Out of Scope

- WebSocketまたはUnix-socket transport。
- Remote App Server exposure、TLS termination、WebSocket bearer authentication。
- `CODEX_ACCESS_TOKEN` fallback。
- Experimental App Server APIs。
- Multiple thread management、fork、archive UI。
- Autonomous approval、sandbox bypass、unrestricted filesystem access。
- Cloud deployment、centralized monitoring、multi-region DR。
- U10 Electron packaging and distribution。

## Acceptance Criteria

1. Existing Codex login環境でGUIがreal App Serverへstdio接続し、Real statusを表示する。
2. Creator promptがWorkspace-scoped thread/turnとして送信され、agent responseがstream表示される。
3. Restart後にWorkspace threadがresumeされる。
4. Command/file change requestは既存承認UIでapproveされるまで実行されない。
5. Deny、timeout、disconnect、malformed protocolはfail closedになり、local workを失わない。
6. Manual reconnectと明示Mock modeが利用できる。
7. Existing draft、asset、production、Preview、Render、CLI workflowsが回帰しない。
8. Example testsとfull PBT suiteがtypecheck、default tests、Studio buildでpassする。

## Extension Compliance

### Security Baseline

- **Compliant by requirement**: SECURITY-05、06、08、09、10、11、12、13、15。Validation、least privilege、approval、hardening、supply-chain verification、credential isolation、safe deserialization、fail-closed behaviorを必須化した。
- **N/A**: SECURITY-01、02、04、07、14。U9はnetwork intermediary、HTML-serving endpoint、cloud network、centralized security monitoringを持たないlocal processである。
- **SECURITY-03**: Local structured application loggingとsecret redactionを適用する。Centralized serviceは非deployable personal toolのためN/A。
- **Blocking findings**: なし。

### Resiliency Baseline

- **Compliant by requirement**: RESILIENCY-01、02、03、04、10、15。Criticality、explicit N/A recovery decision、change/rollback、bounded dependency behavior、lightweight incident processを記録した。
- **N/A**: RESILIENCY-05、06、07、08、09、11、12、13、14。Cloud deployment、regional topology、production traffic、managed persistent store、DR mechanismを持たないlocal personal toolである。
- **Blocking findings**: なし。

### Property-Based Testing

- **Applicable downstream**: PBT-01〜10をFunctional Design、NFR Requirements、Code Generation、Build and Testでfull enforcementする。
- **Requirements stage**: Testable propertiesとcomplementary example-test requirementを定義済み。
- **Blocking findings**: なし。

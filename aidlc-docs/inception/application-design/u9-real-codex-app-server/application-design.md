# Application Design: U9 Real Codex App Server Integration

## Design Outcome

U9はCodex App ServerをElectron main processのapplication-wide singletonとして所有し、stable JSONL-over-stdioで接続する。Rendererはhardened Context Bridgeからpurpose-specific typed APIsだけを利用する。Existing Mock connection、chat history、proposal approval、production workflowsは保持する。

## Primary Decisions

- Electronは `contextIsolation: true`、`nodeIntegration: false`へ移行する。
- Existing Renderer direct filesystem accessはLocal File Serviceとtyped IPCへ移行する。
- App Server serviceは1 process、1 active Workspace threadを管理する。
- Thread IDは `generated/studio/{videoId}/codex-session.json` に保存する。
- Server-initiated approvalはdedicated Pending Approval modelで管理する。
- Deltaはmemory表示し、item completionまたはturn terminal時だけchat historyへ保存する。
- Renderer APIはconnect、send、reconnect、disconnect、approval response、typed event subscriptionに限定する。

## Service Boundaries

- **App Server Service**: Process、handshake、requests、thread/turn、timeouts、cleanup。
- **Protocol Codec**: JSONL serialization、runtime validation、safe parsing。
- **Session Repository**: Workspace thread ID persistence。
- **Approval Controller**: Explicit decisionとexactly-once fail-closed response。
- **Local File Service**: Renderer Node access removalとcanonical file operations。
- **Real Connection Adapter**: Typed IPCをexisting Codex panel contractへ適合。

## Security Compliance

- **Compliant**: SECURITY-05、06、08、09、11、12、13、15。Typed validation、purpose-specific IPC、no shell、credential isolation、explicit approval、safe errors、cleanupを設計した。
- **SECURITY-10**: Lockfile、dependency audit、version-aligned generated schemaをCode Generation/Buildへ要求する。
- **SECURITY-03**: Local structured metadata loggingとsecret/content redactionを設計した。Central log serviceはlocal non-deployed toolのためN/A。
- **N/A**: SECURITY-01、02、04、07、14。Network/cloud/HTML endpointなし。
- **Blocking findings**: なし。Unsafe Renderer boundaryはU9 scope内で解消する。

## Resiliency Compliance

- **Compliant**: RESILIENCY-01、02、03、04、10、15。Low criticality、local recovery、bounded dependency calls、rollback、lightweight incident processを設計した。
- **N/A**: RESILIENCY-05〜09、11〜14。Cloud deployment、traffic service、managed persistence、DRなし。
- **Blocking findings**: なし。

## PBT Compliance

- **Application Design applicability**: Protocol CodecとApproval/Turn coordinatorをpure/stateful test seamsとして分離した。
- **PBT-01〜10**: Detailed properties、framework、generators、seed policyはscheduled Functional Design、NFR Requirements、Code Generation、Build and Testでenforceする。
- **Blocking findings**: なし。

## Detailed Artifacts

- `components.md`
- `component-methods.md`
- `services.md`
- `component-dependency.md`

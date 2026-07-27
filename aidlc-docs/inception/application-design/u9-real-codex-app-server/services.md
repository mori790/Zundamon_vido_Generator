# Services: U9 Real Codex App Server Integration

## App Server Lifecycle Service

### Responsibilities

- 1 application、1 subprocessをenforceする。
- Connect時にCodex executableをresolveし、shellなしで `app-server` を起動する。
- Initialize handshakeを1 connectionにつき1回だけ実行する。
- Active Workspace変更時にcurrent turnを安全にterminal化してthread contextを切り替える。
- Exit、stderr diagnostic、timeoutをsafe connection eventへ変換する。

### Connect Orchestration

1. videoIdとWorkspace rootをvalidateする。
2. Existing processがhealthyなら再利用する。
3. Processを起動し、bounded line readerを開始する。
4. `initialize` response後に `initialized` を送る。
5. Session Repositoryからthread IDを読む。
6. `thread/resume`、または`thread/start`を実行する。
7. Resultをsession fileへ保存し、connected eventを通知する。

## Turn Streaming Service

### Responsibilities

- User inputとactive Workspace/threadをvalidateする。
- `turn/start` requestをcorrelateする。
- Agent deltaをin-memory bufferへappendする。
- Command/file-change progressをtyped eventsへ変換する。
- Item completionまたはturn terminal時だけfinal ChatMessageを生成する。

### Persistence Rule

- Deltaごとのfilesystem writeは禁止する。
- Completed assistant itemとterminal turnだけexisting chat history persistenceへ渡す。
- Failure時はpartial textをUIに残せるが、success messageとして確定しない。

## Approval Mediation Service

### Responsibilities

- Server requestをruntime schemaでvalidateする。
- Dedicated pending approvalをRendererへ通知する。
- Explicit approve/denyをprotocol responseへ変換する。
- Timeout、disconnect、window close、shutdown時はdenyする。

### Separation from Existing Proposals

- Existing Proposalはassistant contentから生成するuser workflow action。
- Pending App Server Approvalはprotocol requestへ同期responseを返すsecurity boundary。
- Visual patternは共有するが、state modelとpersistenceは混在させない。

## Local State Service

### Responsibilities

- Rendererのcurrent direct Node filesystem accessをmain processへ移す。
- Script、asset、workspace、chat history、Codex sessionのpurpose-specific APIsを提供する。
- Atomic writeが既存patternにない場合はtemporary file plus renameをFunctional Designで評価する。

## Failure and Recovery Service Behavior

- Request timeout、malformed JSONL、broken pipeはfail closed。
- Retryはbounded backoff。上限後はmanual reconnect。
- Auto Mock fallbackは行わない。
- Non-Codex Studio機能はApp Server failureから分離して継続可能にする。
- Git known-good revisionとlockfileをrelease rollback boundaryとする。

## Observability

- Local structured logsはtimestamp、level、event code、correlation IDを含める。
- Prompt content、assistant content、credential、raw approval payloadはlogしない。
- Process start/exit、handshake state、request timeout、approval decisionのmetadataだけを記録する。

# Components: U9 Real Codex App Server Integration

## C1: Hardened Electron Shell

- **Purpose**: Trusted main/preload boundaryを提供する。
- **Responsibilities**:
  - `contextIsolation: true`、`nodeIntegration: false`でwindowを生成する。
  - Context Bridge経由のtyped APIだけをRendererへ公開する。
  - App shutdown時にApp Serverとpending requestsをcleanupする。
- **Interfaces**: C2 App Server Service、C6 Preload Bridge、C9 Local File Service。

## C2: App Server Service

- **Purpose**: Application-wide singletonとして `codex app-server` subprocessを所有する。
- **Responsibilities**:
  - Shellなしでprocessを必要時起動する。
  - Initialize、thread start/resume、turn start、disconnect、reconnectをorchestrateする。
  - Request ID correlation、timeouts、bounded retry、terminal cleanupを管理する。
  - Parsed typed eventsだけをC6へ通知する。
- **Interfaces**: C3 Protocol Codec、C4 Session Repository、C5 Approval Controller、C6 IPC。

## C3: App Server Protocol Codec

- **Purpose**: JSONL protocolのserialization、parsing、runtime validationをpure boundaryとして提供する。
- **Responsibilities**:
  - Stable request、response、notification、server requestをvalidateする。
  - ID、text、array、line byte sizeをallowlistと上限で検証する。
  - Unknown stable notificationを安全にignore可能なtyped resultへ変換する。
  - Credentialやraw protocolをuser-facing errorへ含めない。
- **Interfaces**: C2だけが利用する。Rendererへ公開しない。

## C4: Workspace Codex Session Repository

- **Purpose**: Workspaceごとのthread identityをchat historyと分離して永続化する。
- **Responsibilities**:
  - `generated/studio/{videoId}/codex-session.json` をread/writeする。
  - videoIdをvalidateし、canonical Workspace配下へpathを限定する。
  - Invalid、missing、oversized sessionをsafe empty stateとして扱う。
- **Interfaces**: C2 App Server Service、C9 Local File Service。

## C5: App Server Approval Controller

- **Purpose**: Server-initiated mutation requestをfail closedで仲介する。
- **Responsibilities**:
  - Dedicated Pending Approval modelを生成する。
  - Existing proposal card visual patternへtyped eventを送る。
  - Approve、deny、timeout、disconnectをexactly-once protocol responseへ変換する。
  - Unresolved approvalをprocess shutdown時にdenyする。
- **Interfaces**: C2 App Server Service、C6 IPC、C8 Codex Panel。

## C6: Codex IPC and Preload Bridge

- **Purpose**: Rendererへnarrow Codex APIを提供する。
- **Responsibilities**:
  - connect、send、reconnect、disconnect、approval responseを公開する。
  - Connection、stream、approval event subscriptionを公開する。
  - Generic method、raw params、arbitrary cwd、process handleを公開しない。
  - Subscriber cleanup functionを返す。
- **Interfaces**: C2/C5とC7の境界。

## C7: Real Codex Connection Adapter

- **Purpose**: Existing `CodexConnection` consumerとtyped IPCを接続するRenderer adapter。
- **Responsibilities**:
  - Real connection stateとstreamed assistant draftを管理する。
  - Deltaをmemory上で集約し、item completionまたはturn terminalでfinal messageを返す。
  - Manual reconnectとdisconnectを提供する。
- **Interfaces**: C6 Bridge、C8 Codex Panel。

## C8: Codex Panel Streaming UI

- **Purpose**: Real/Mock mode、stream status、pending approvalsをcreatorへ表示する。
- **Responsibilities**:
  - Default Real、explicit Mock selectorを提供する。
  - Agent delta、turn status、command/file-change progressをaccessible textで表示する。
  - Pending Approval cardのapprove/deny controlsを表示する。
  - Completion/terminal時だけchat history persistenceを要求する。
- **Interfaces**: C7 Real adapter、existing Mock adapter、C5 approval events、existing chat/proposal state。

## C9: Local File Service

- **Purpose**: Rendererから既存Node filesystem accessを除去する。
- **Responsibilities**:
  - Workspace discovery、script、asset、chat history、Codex session file operationsをmain processで実行する。
  - Existing path validationとcanonical rootsを再利用する。
  - Purpose-specific IPC methodsだけをC6と同じContext Bridgeへ公開する。
- **Interfaces**: Existing workspace/script/asset/chat clients、C1 main IPC。

## C10: Mock Codex Connection

- **Purpose**: Explicit development and diagnostic modeを維持する。
- **Responsibilities**:
  - Real connectionを偽装せずMock statusを表示する。
  - Existing deterministic test behaviorを維持する。
- **Interfaces**: C8 Codex Panel。

## Component Boundary Rules

- RendererはNode builtin、filesystem、child processへ直接accessしない。
- C2だけがApp Server processとraw JSONLを扱う。
- C5だけがserver-initiated approval responseを決定する。
- C4のthread IDとexisting chat historyは別file、別schemaとする。

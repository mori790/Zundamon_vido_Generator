# Component Methods: U9 Real Codex App Server Integration

## Shared Types

```ts
type CodexConnectionMode = 'real' | 'mock';
type CodexConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type TurnStatus = 'starting' | 'running' | 'completed' | 'failed' | 'interrupted';
type ApprovalDecision = 'approved' | 'denied';

type CodexConnectRequest = {videoId: string};
type CodexSendRequest = {videoId: string; message: string};
type CodexApprovalResponse = {approvalId: string; decision: ApprovalDecision};
```

Exact protocol payload types are generated or validated against the installed Codex CLI schema during Code Generation。

## C2: App Server Service

```ts
connect(request: CodexConnectRequest): Promise<CodexConnectionSnapshot>
send(request: CodexSendRequest): Promise<{turnId: string}>
reconnect(request: CodexConnectRequest): Promise<CodexConnectionSnapshot>
disconnect(): Promise<void>
respondToApproval(response: CodexApprovalResponse): Promise<void>
shutdown(): Promise<void>
subscribe(listener: (event: CodexClientEvent) => void): () => void
```

- `connect` はprocess start、initialize、thread resume/startを完了してからconnectedを返す。
- `send` はactive Workspace/thread一致を検証してturnを開始する。
- `shutdown` はpending approvalをdenyし、pending requestをrejectしてprocessを停止する。

## C3: Protocol Codec

```ts
serializeClientMessage(message: CodexClientMessage): string
parseServerLine(line: string): ProtocolParseResult
validateRequestId(value: unknown): string | number | null
redactProtocolError(error: unknown): SafeCodexError
```

- `serializeClientMessage` は1 messageを1 JSONL lineへ変換する。
- `parseServerLine` はbyte limit、JSON parse、runtime schema validationを行う。
- Parse failureはthrowしないtyped failureとしてC2へ返す。

## C4: Session Repository

```ts
load(videoId: string): Promise<CodexSessionState | null>
save(videoId: string, state: CodexSessionState): Promise<void>
clear(videoId: string): Promise<void>
```

- Session stateはthread ID、updatedAt、protocol version metadataだけを保持する。
- Chat messages、credential、prompt本文は保存しない。

## C5: Approval Controller

```ts
open(request: ValidatedApprovalRequest): PendingCodexApproval
resolve(approvalId: string, decision: ApprovalDecision): CodexApprovalResponse | null
expire(approvalId: string): CodexApprovalResponse | null
denyAll(reason: string): CodexApprovalResponse[]
snapshot(): PendingCodexApproval[]
```

- 各approval IDは高々1回だけterminal responseを生成する。
- Unknown、duplicate、expired IDはapprovalを生成せずfail closedにする。

## C6: Renderer Codex API

```ts
connect(request: CodexConnectRequest): Promise<CodexConnectionSnapshot>
send(request: CodexSendRequest): Promise<{turnId: string}>
reconnect(request: CodexConnectRequest): Promise<CodexConnectionSnapshot>
disconnect(): Promise<void>
respondToApproval(response: CodexApprovalResponse): Promise<void>
onEvent(listener: (event: CodexClientEvent) => void): () => void
```

- `request(method, params)` のようなgeneric escape hatchは提供しない。

## C7: Real Connection Adapter

```ts
connect(): Promise<CodexConnectionState>
sendMessage(input: CodexUserInput): Promise<ChatMessage>
reconnect(): Promise<CodexConnectionState>
disconnect(): Promise<void>
subscribe(listener: (state: StreamingChatState) => void): () => void
respondToApproval(approvalId: string, decision: ApprovalDecision): Promise<void>
```

- Existing `CodexConnection` contractを維持し、optional streaming capabilityを追加する。

## C9: Local File API

```ts
loadWorkspace(videoId: string): Promise<WorkspaceLoadResult>
loadScript(videoId: string): Promise<unknown>
saveScript(videoId: string, script: unknown): Promise<void>
loadChatHistory(videoId: string): Promise<ChatHistory>
saveChatHistory(videoId: string, history: ChatHistory): Promise<void>
selectAndCopyAsset(request: AssetCopyRequest): Promise<AssetCopyResult>
```

- Rendererからabsolute target pathを受け取らない。
- Existing purpose-specific clientsを同じinterfaceへ移行する。

## Method-Level Security

- 全IPC requestはmain processで再validateする。
- All mutations use canonical Workspace roots and allowlisted operations。
- Error responseはsafe codeとactionable messageだけを返す。

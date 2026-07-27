# Domain Entities: U2 Codex App Server Connection

## `CodexConnectionMode`

```ts
type CodexConnectionMode = 'mock' | 'real';
```

## `CodexConnectionState`

```ts
type CodexConnectionState =
  | {status: 'mock-ready'}
  | {status: 'connecting'}
  | {status: 'connected'}
  | {status: 'disconnected'; message: string}
  | {status: 'error'; message: string};
```

## `ChatRole`

```ts
type ChatRole = 'user' | 'assistant' | 'system';
```

## `ChatMessage`

```ts
type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};
```

## `ChatSession`

```ts
type ChatSession = {
  videoId: string;
  messages: ChatMessage[];
  connectionMode: CodexConnectionMode;
  connectionState: CodexConnectionState;
};
```

## `CodexConnection`

```ts
type CodexConnection = {
  connect(): Promise<CodexConnectionState>;
  sendMessage(input: CodexUserInput): Promise<ChatMessage>;
  disconnect(): Promise<void>;
};
```

## `CodexUserInput`

```ts
type CodexUserInput = {
  videoId: string;
  message: string;
  context?: {
    workspaceMode: 'existing-script' | 'empty-draft';
    title?: string;
  };
};
```

## `ChatHistoryStore`

```ts
type ChatHistoryStore = {
  load(videoId: string): Promise<ChatMessage[]>;
  save(videoId: string, messages: ChatMessage[]): Promise<void>;
};
```


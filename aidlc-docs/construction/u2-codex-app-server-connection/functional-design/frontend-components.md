# Frontend Components: U2 Codex App Server Connection

## Component Hierarchy

```text
WorkspaceShell
  WorkspaceHeader
  CodexPanel
    CodexConnectionStatus
    ChatMessageList
    ChatMessageItem
    ChatInputForm
    ChatErrorBanner
```

## `CodexPanel`

- Owns U2 chat UI state for the active workspace.
- Receives current `videoId` and workspace mode from `WorkspaceShell`.
- Loads persisted chat history on mount.
- Initializes mock connection mode for the first implementation.

### State

- `messages`: `ChatMessage[]`.
- `connectionState`: `CodexConnectionState`.
- `sending`: `boolean`.
- `error`: `string | null`.

## `CodexConnectionStatus`

- Shows whether the panel is in mock mode, connected, disconnected, connecting, or error state.
- In mock mode, clearly labels the assistant as mock.

## `ChatMessageList`

- Displays messages in chronological order.
- Supports empty state when no conversation exists.

## `ChatMessageItem`

- Displays one message with role and content.
- User and assistant messages should be visually distinct.

## `ChatInputForm`

- Lets the creator submit a non-empty message.
- Disables submit while sending.
- In disconnected/error real mode, input is disabled.
- In mock mode, input remains enabled.

## `ChatErrorBanner`

- Displays connection, send, or persistence errors.
- Errors are visible but should not hide the workspace shell.

## Automation-Friendly UI

Future implementation should include stable test IDs:

- `codex-panel`
- `codex-connection-status`
- `codex-message-list`
- `codex-message-user`
- `codex-message-assistant`
- `codex-chat-input`
- `codex-chat-send-button`
- `codex-chat-error`


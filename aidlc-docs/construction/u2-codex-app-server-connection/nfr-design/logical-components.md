# Logical Components: U2 Codex App Server Connection

## `CodexConnection`

- **Purpose**: Interface for mock and future real Codex communication.
- **Inputs**: `CodexUserInput`.
- **Outputs**: assistant `ChatMessage`.
- **NFR Role**: Enables mock-first implementation without coupling UI to mock logic.

## `MockCodexConnection`

- **Purpose**: Deterministic local connection for U2.
- **Behavior**:
  - Connects immediately to `mock-ready`.
  - Replies after approximately 300ms.
  - Includes helpful planning-oriented text.
- **NFR Role**: Keeps development unblocked when real Codex App Server is not integrated.

## `ChatStateController`

- **Purpose**: Owns message append and send/receive state transitions.
- **Behavior**:
  - Rejects empty input.
  - Appends user message.
  - Invokes connection.
  - Appends assistant message.
  - Handles send failure.
- **NFR Role**: Keeps behavior testable outside React.

## `ChatHistoryStore`

- **Purpose**: Loads and saves workspace-scoped chat history.
- **Path**: `generated/studio/{videoId}/chat-history.json`.
- **NFR Role**: Separates chat persistence from canonical video script JSON.

## `CodexPanelViewModel`

- **Purpose**: Maps connection, chat, error, and persistence state into renderer UI props.
- **NFR Role**: Keeps the React panel simple and predictable.

## `CodexPanel`

- **Purpose**: User-facing chat panel.
- **NFR Role**:
  - Shows Mock status.
  - Shows send/receive state.
  - Keeps workspace usable on errors.

## Future `RealCodexConnection`

- **Purpose**: Later Codex App Server implementation.
- **Status**: Deferred.
- **NFR Role**: Must satisfy the same `CodexConnection` interface to avoid rewriting the UI.


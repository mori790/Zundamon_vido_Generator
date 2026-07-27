# Business Logic Model: U2 Codex App Server Connection

## Scope

U2 adds the Codex panel and chat connection model to the existing Studio workspace shell. It enables the creator to discuss a video idea after opening a workspace.

U2 does not convert Codex responses into JSON drafts. Draft detection and proposal routing are handled by U4.

## Core Workflow

1. User opens a video workspace through U1.
2. Workspace shell displays a Codex panel area.
3. Codex panel initializes a chat session for the current `videoId`.
4. U2 uses a mock Codex connection first.
5. User sends a message.
6. Connection returns an assistant message.
7. Chat history is stored locally per workspace.
8. If real Codex connection is unavailable in a later mode, the panel shows a disconnected/error state.

## Connection Modes

### Mock Mode

- Used for the first U2 implementation.
- Provides deterministic assistant replies for GUI development.
- Does not require Codex App Server to be available.

### Real Mode

- Deferred until Codex App Server protocol work.
- Will use the same `CodexConnection` interface as mock mode.
- On failure, shows an error state and does not block non-Codex workspace UI.

## State Model

### Connection State

- `mock-ready`: mock connection is available.
- `connecting`: real connection attempt is in progress.
- `connected`: real connection is active.
- `disconnected`: no connection is available.
- `error`: connection or authentication failed.

### Chat Session State

- `idle`: ready for input.
- `sending`: user message is being sent.
- `receiving`: assistant response is being received.
- `failed`: last send failed.

## Data Flow

- Codex Panel receives `videoId` and workspace context from Workspace Shell.
- User message is appended to in-memory and persisted chat history.
- Codex Connection returns assistant message.
- Assistant message is appended to in-memory and persisted chat history.
- Local persistence writes chat history by workspace.

## Business Boundaries

- U2 may store chat messages locally.
- U2 may not modify `input/{videoId}.json`.
- U2 may not run validation, voice generation, timeline generation, preview, or render commands.
- U2 may not treat a JSON-looking message as an applied draft.


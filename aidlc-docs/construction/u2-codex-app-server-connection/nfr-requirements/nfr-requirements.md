# NFR Requirements: U2 Codex App Server Connection

## Scope

U2 covers the Codex panel, mock connection, chat state, connection state display, local chat history persistence, and error handling. Real Codex App Server protocol implementation is deferred.

## Responsiveness

- Mock replies should use an approximately 300ms delay.
- The panel should expose sending/receiving UI state.
- The rest of the workspace should remain usable while the chat panel is sending or receiving.

## Reliability

- Chat send failures must not crash the Studio app.
- Chat history load failures must be non-blocking.
- If history cannot be loaded, the panel starts empty and shows a warning or error banner.
- Mock mode must always be available for local development.

## Persistence

- Chat history is stored at `generated/studio/{videoId}/chat-history.json`.
- Chat history is separate from canonical script JSON.
- Chat history persistence must not modify `input/{videoId}.json`.
- Persisted chat history is a convenience feature, not a source of truth for video generation.

## Transparency

- The UI must clearly display that U2 is using Mock mode while real Codex App Server integration is not implemented.
- Mock replies must not be presented as real Codex responses.

## Testability

- Chat state and mock connection require unit tests.
- CodexPanel requires component tests.
- File I/O persistence tests are not mandatory for U2 MVP.

## Security and Safety

- U2 must not execute commands.
- U2 must not write to `input/`.
- U2 must not parse or apply assistant output as a JSON draft.
- JSON proposal handling is deferred to U4.


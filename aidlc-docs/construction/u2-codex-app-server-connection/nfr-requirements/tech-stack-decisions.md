# Tech Stack Decisions: U2 Codex App Server Connection

## Connection Strategy

- **Decision**: Implement a mock Codex connection first behind a `CodexConnection` interface.
- **Rationale**: This lets the GUI chat experience progress before real Codex App Server protocol details are finalized.

## Mock Timing

- **Decision**: Mock connection replies after approximately 300ms.
- **Rationale**: The delay makes sending/receiving state visible without making the UI feel slow.

## Persistence Location

- **Decision**: Store chat history in `generated/studio/{videoId}/chat-history.json`.
- **Rationale**: This keeps GUI-generated metadata separate from canonical input scripts while staying inside the existing generated-artifact area.

## UI Labeling

- **Decision**: Clearly show `Mock` in the Codex panel until real Codex App Server integration exists.
- **Rationale**: The user should not confuse deterministic mock responses with real Codex responses.

## Test Stack

- **Decision**: Use Vitest for chat state and mock connection tests, plus React Testing Library for CodexPanel component tests.
- **Rationale**: This matches the U1 test approach and keeps U2 verification lightweight.

## Deferred Decisions

- Real Codex App Server authentication and transport details are deferred.
- JSON proposal detection is deferred to U4.
- Approval actions are deferred to U4.


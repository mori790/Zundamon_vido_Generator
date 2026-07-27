# NFR Design Patterns: U2 Codex App Server Connection

## Connection Adapter Pattern

- Define a `CodexConnection` interface.
- Implement `MockCodexConnection` first.
- Later real Codex App Server integration must implement the same interface.
- UI should depend on the interface, not directly on a specific connection implementation.

## Mock Transparency Pattern

- Show `Mock` in the Codex connection status.
- Mock assistant messages should be visually normal but connection status must make their source clear.
- Do not label mock output as real Codex.

## Async Chat State Pattern

- Submitting a message moves state from `idle` to `sending`.
- Waiting for mock response moves state to `receiving`.
- Successful response returns state to `idle`.
- Failed send moves state to `failed` with a displayable error.

## Non-Blocking Persistence Pattern

- Load chat history after the panel mounts.
- Save chat history after message changes.
- Persistence failures show a non-blocking warning.
- Persistence failures do not block sending new messages.

## Workspace-Scoped History Pattern

- History path is `generated/studio/{videoId}/chat-history.json`.
- Switching workspaces loads that workspace's chat history.
- History is not used as the source of truth for scripts or generation.

## Safety Boundary Pattern

- U2 has no command execution capability.
- U2 has no script write capability.
- U2 does not parse assistant output into JSON draft state.

## Test Pattern

- Test chat state transitions as pure logic.
- Test mock connection timing and response shape.
- Test `CodexPanel` rendering, send interaction, and Mock status display.


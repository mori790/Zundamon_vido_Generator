# Business Rules: U2 Codex App Server Connection

## Chat Rules

- A chat session belongs to one `videoId`.
- User messages must be non-empty after trimming.
- Messages are appended in chronological order.
- The UI must show whether a message is from the creator, assistant, or system.

## Connection Rules

- The first implementation uses mock connection mode.
- Mock mode must not pretend that a real Codex App Server connection exists.
- Real connection failure must show a clear disconnected/error state.
- Non-Codex workspace UI must remain available when Codex is disconnected.

## Persistence Rules

- U2 stores chat history locally by workspace.
- Chat persistence is for conversation continuity only.
- Chat persistence must not create or modify the canonical video script.
- If chat history cannot be loaded, the panel starts with an empty chat and displays a non-blocking warning.

## JSON Boundary Rules

- U2 can display any assistant text, including JSON-looking text.
- U2 must not parse assistant JSON into draft state.
- U2 must not apply assistant output to files.
- JSON proposal detection and approval belongs to U4.

## Error Rules

- Send failures produce a visible error message in the Codex panel.
- Connection/authentication failures produce a panel-level error state.
- Failed chat persistence must not crash the app.


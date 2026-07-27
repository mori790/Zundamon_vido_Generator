# Interaction Diagrams

These text sequences are the parser-safe alternatives to graphical sequence diagrams.

## Real Codex Conversation

1. Creator submits a prompt in `CodexPanel`.
2. `RealCodexConnection` calls preload `codexApi.send`.
3. Electron Main delegates to `CodexAppServerService`.
4. Service writes `turn/start` JSONL to `codex app-server`.
5. App Server emits agent-message deltas.
6. Main forwards typed events through IPC.
7. Renderer batches visible deltas at 50 ms.
8. On `turn/completed`, Renderer persists the completed message and extracts proposals.

## App Server Approval

1. App Server sends a request-approval message.
2. Main validates the method and creates a pending approval with timeout.
3. Renderer displays a dedicated approval card.
4. Creator chooses Approve or Deny.
5. Main settles the request exactly once.
6. Timeout, unknown request, disconnect, or shutdown resolves as deny.

## Script Draft Apply

1. Creator edits raw or structured draft state.
2. Shared draft logic validates and normalizes the script.
3. Creator approves apply.
4. Renderer calls purpose-specific local-file API.
5. Main writes the backup before the active script.
6. Workspace and Preview refresh from the applied script.

## Production Command

1. Creator or approved command proposal requests Validate, Voice, Timeline, Preview, or Render.
2. Renderer calls `commandApi.start`.
3. Main `CommandRunner` starts the existing npm/TypeScript command.
4. Main emits operation and log events.
5. Renderer updates progress, ETA, logs, Stop, retry, and recovery hints.
6. Successful Voice/Timeline triggers Preview refresh.
7. Successful Render verifies output and enables Finder reveal.

## Asset Selection

1. Renderer requests image selection.
2. Main opens the native dialog and validates file type and size.
3. Main returns a token, file name, and bytes, not a reusable raw path.
4. Renderer decodes the image and requests tokenized copy.
5. Main confines the destination under `public/visuals/{videoId}/`.
6. Renderer updates the scene draft only after successful copy.

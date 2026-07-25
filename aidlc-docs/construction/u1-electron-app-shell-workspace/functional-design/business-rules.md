# Business Rules: U1 Electron App Shell and Workspace Foundation

## Workspace Selection Rules

- The start screen must show both existing scripts from `input/` and a new video ID input.
- A video ID entered by the user must be non-empty.
- A selected existing script determines the `videoId` from the filename without `.json`.
- Existing scripts should be listed from `input/*.json` only.

## Workspace Opening Rules

- If `input/{videoId}.json` exists and loads successfully, open the workspace in `existing-script` mode.
- If `input/{videoId}.json` does not exist, open the workspace in `empty-draft` mode.
- If `input/{videoId}.json` exists but cannot be parsed or validated, do not open the workspace.
- If workspace opening fails, show an error on the start screen.

## Error Rules

- Invalid JSON or schema validation failure blocks workspace open for U1.
- File system errors should be shown without crashing the GUI.
- Errors should include the target path when available.
- Codex unavailability must not block U1 because Codex belongs to U2.

## Compatibility Rules

- U1 must not move or modify `input/` files.
- U1 must preserve the current project layout.
- U1-created empty draft state is in memory only and must not create `input/{videoId}.json`.

## UI Rules

- The app must provide a clear route back to the start screen from an open workspace.
- The workspace header should show the current `videoId` and mode.
- Empty draft mode should make clear that no script has been saved yet.


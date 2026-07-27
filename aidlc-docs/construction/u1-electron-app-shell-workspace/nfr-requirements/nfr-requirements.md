# NFR Requirements: U1 Electron App Shell and Workspace Foundation

## Scope

U1 covers the Electron desktop shell, workspace selection screen, existing script list, new video ID input, script loading, empty draft workspace opening, and invalid script error display.

## Performance

- The MVP target is that the initial screen appears within a few seconds.
- U1 should avoid heavy generation, rendering, or VOICEVOX checks during startup.
- Listing `input/*.json` should be lightweight and local-only.

## Responsiveness

- The renderer should remain responsive while project summaries are loaded.
- File loading errors should update UI state rather than crash the app.
- Workspace open attempts should have visible loading or disabled-submit behavior if they are not instantaneous.

## Reliability

- Invalid or unreadable JSON must not crash the Electron app.
- A failed workspace open must leave the app on the start screen with a clear error.
- Missing `input/{videoId}.json` is not an error; it opens an empty draft workspace.

## Local File Access

- MVP may allow renderer-side local file access where practical.
- The design should still keep file access behind narrow helper functions so it can later move behind Electron IPC if needed.
- U1 must not modify or delete files.

## Safety

- U1 must be read-only for existing project files.
- Empty draft workspace state must remain in memory and must not create files.
- Existing CLI-compatible folder layout must remain untouched.

## Testability

- Workspace state logic must have unit tests.
- React component behavior for start screen and workspace shell must have minimum tests.
- Electron launch E2E smoke is not required for U1 MVP.

## Usability

- Start screen must show existing projects and new video ID input.
- Workspace shell must clearly show the current video ID and mode.
- Invalid JSON errors should mention that the workspace was not opened.


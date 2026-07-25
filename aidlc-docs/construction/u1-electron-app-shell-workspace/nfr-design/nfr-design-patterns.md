# NFR Design Patterns: U1 Electron App Shell and Workspace Foundation

## Startup Responsiveness Pattern

- Render the initial shell immediately.
- Load project summaries asynchronously after renderer mount.
- Do not perform VOICEVOX checks, Remotion bundling, rendering, or command discovery during U1 startup.
- Show loading state only for the project list area, not the whole app shell.

## Read-Only Workspace Discovery Pattern

- U1 reads from `input/*.json` only.
- U1 does not create, modify, move, or delete files.
- Missing `input/{videoId}.json` is represented as `empty-draft` workspace state, not a file operation.

## File Access Helper Boundary

- MVP may use renderer-side filesystem access.
- File operations should still be wrapped in small helpers:
  - `listVideoProjects()`
  - `loadWorkspace(videoId)`
  - `scriptExists(videoId)`
- This keeps the future move to Electron IPC local and mechanical.

## Error Isolation Pattern

- Workspace open errors return structured `WorkspaceError` values.
- Invalid scripts do not throw through the UI tree.
- Start screen remains active when workspace open fails.
- Error display includes a human-readable message and target path when available.

## State Machine Pattern

- App-level screen state is explicit:
  - `booting`
  - `ready`
  - `workspace-open`
  - `workspace-error`
- Workspace mode is explicit:
  - `existing-script`
  - `empty-draft`

## Test Boundary Pattern

- Workspace state transitions are tested as pure logic.
- Start screen and workspace shell are tested as React components.
- Electron launch smoke is deferred.

## Automation-Friendly UI Pattern

- Interactive controls use stable `data-testid` attributes.
- Test IDs should describe component and purpose rather than visual position.


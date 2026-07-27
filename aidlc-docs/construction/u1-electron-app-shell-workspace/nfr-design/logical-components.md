# Logical Components: U1 Electron App Shell and Workspace Foundation

## Logical Component Overview

U1 is split into small logical pieces that support MVP delivery without overcommitting to later Codex, command, preview, or render behavior.

## `WorkspaceDiscovery`

- **Purpose**: Finds existing JSON scripts under `input/`.
- **Inputs**: Workspace root.
- **Outputs**: `VideoProjectSummary[]`.
- **NFR Role**: Keeps startup lightweight by doing only local file listing.

## `WorkspaceLoader`

- **Purpose**: Opens an existing or empty video workspace.
- **Inputs**: `videoId`.
- **Outputs**: `WorkspaceState` or `WorkspaceError`.
- **NFR Role**: Isolates invalid JSON and file-system errors.

## `WorkspaceStateMachine`

- **Purpose**: Keeps app and workspace modes explicit.
- **Inputs**: user intent and loader results.
- **Outputs**: app screen state and workspace state.
- **NFR Role**: Makes error and empty-draft flows testable.

## `FileAccessHelpers`

- **Purpose**: Thin helper boundary around local script discovery and loading.
- **Inputs**: paths and video IDs.
- **Outputs**: file metadata, parsed script, existence checks.
- **NFR Role**: Allows renderer-side access for MVP while preserving future IPC migration.

## `StartScreenView`

- **Purpose**: Presents project list, new video ID input, loading state, and errors.
- **NFR Role**: Keeps the app usable even when script loading fails.

## `WorkspaceShellView`

- **Purpose**: Presents current video ID, workspace mode, and placeholder content for later units.
- **NFR Role**: Provides stable UI surface for U2 and U3.

## `WorkspaceTestHarness`

- **Purpose**: Test helper for workspace state transitions and component states.
- **NFR Role**: Enables required unit and component test coverage without Electron E2E.


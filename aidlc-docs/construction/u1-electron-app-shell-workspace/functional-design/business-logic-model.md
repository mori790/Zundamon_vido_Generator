# Business Logic Model: U1 Electron App Shell and Workspace Foundation

## Scope

U1 establishes the desktop app shell and single-video workspace foundation. It does not implement Codex chat, JSON draft review, command execution, preview, or rendering. It provides the state and UI frame those later units depend on.

## Core Workflow

1. Electron app starts.
2. Renderer displays a start screen with:
   - Existing JSON scripts discovered from `input/`.
   - New video ID input.
3. User selects an existing video ID or enters a new one.
4. Workspace Controller attempts to open the workspace.
5. If `input/{videoId}.json` exists and loads successfully, workspace opens with active script.
6. If `input/{videoId}.json` does not exist, workspace opens as an empty draft workspace.
7. If `input/{videoId}.json` exists but fails to load or parse, workspace does not open and the start screen shows an error.

## State Model

### App State

- `booting`: Electron and renderer are starting.
- `ready`: Start screen can list or create workspaces.
- `workspace-open`: A video workspace is open.
- `workspace-error`: A workspace open attempt failed.

### Workspace Open Result

- `opened-existing`: Existing script loaded successfully.
- `opened-empty-draft`: No script exists; empty draft workspace opened.
- `failed-invalid-script`: Script exists but cannot be parsed or validated.
- `failed-io`: File system operation failed.

### Workspace Mode

- `existing-script`: Active script is loaded from `input/{videoId}.json`.
- `empty-draft`: No active saved script exists yet.

## Data Flow

- Renderer requests existing script list from Electron main process.
- Main process reads `input/*.json` and returns video IDs plus basic file metadata.
- Renderer asks Workspace Controller to open a selected or entered video ID.
- Script Repository Adapter checks and loads `input/{videoId}.json`.
- Workspace Controller sets workspace state or returns a displayable error.

## Business Boundaries

- U1 may read script files to establish workspace state.
- U1 must not save scripts.
- U1 must not generate voices, timelines, previews, or renders.
- U1 must keep existing CLI folder conventions unchanged.


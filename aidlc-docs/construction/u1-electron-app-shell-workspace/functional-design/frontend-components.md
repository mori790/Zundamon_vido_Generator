# Frontend Components: U1 Electron App Shell and Workspace Foundation

## Component Hierarchy

```text
StudioApp
  StartScreen
    ProjectList
    NewProjectForm
    WorkspaceOpenError
  WorkspaceShell
    WorkspaceHeader
    WorkspacePlaceholder
```

## `StudioApp`

- Owns top-level application state.
- Decides whether to render `StartScreen` or `WorkspaceShell`.
- Requests project summaries on startup.

### State

- `screen`: `start` or `workspace`.
- `projects`: `VideoProjectSummary[]`.
- `workspace`: `WorkspaceState | null`.
- `error`: `WorkspaceError | null`.

## `StartScreen`

- Shows existing scripts and new video ID input.
- Handles selection and creation requests.

### Interactions

- Select existing project.
- Enter new video ID.
- Submit open request.

## `ProjectList`

- Displays discovered scripts from `input/`.
- Selecting an item opens that workspace.

## `NewProjectForm`

- Lets the user enter a new `videoId`.
- Submitting a nonexistent ID opens an empty draft workspace.

### Validation

- Video ID must be non-empty.
- Further filename validation can be added during implementation planning.

## `WorkspaceOpenError`

- Displays workspace-opening failures.
- Shows invalid JSON, schema, or file system messages.

## `WorkspaceShell`

- Shows the current video workspace.
- U1 only needs a shell placeholder for later units.
- Displays the current video ID, workspace mode, and basic script state.

## `WorkspaceHeader`

- Shows:
  - Current video ID.
  - Existing script or empty draft mode.
  - Back/start action.

## Automation-Friendly UI

Future implementation should include stable test IDs:

- `start-screen-project-list`
- `start-screen-new-video-id-input`
- `start-screen-open-button`
- `workspace-header-video-id`
- `workspace-header-mode`
- `workspace-back-button`


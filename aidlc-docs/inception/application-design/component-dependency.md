# Component Dependency: GUI with Embedded Codex Panel

## Dependency Principles

- Existing CLI/core pipeline remains authoritative for generation.
- Electron main process owns local process and file capabilities.
- Renderer owns GUI state and direct Codex App Server interaction.
- Codex proposals are not trusted as applied changes until Action Approval Controller approves them.
- Draft JSON is in-memory until applied.

## Dependency Matrix

| Component | Depends On | Notes |
|---|---|---|
| Electron App Shell | Node runtime, Electron APIs | Hosts renderer and IPC bridge |
| Workspace Controller | Script Repository Adapter, Draft State Store, Command Runner | Coordinates single-video state |
| Script Repository Adapter | Electron file bridge, existing `input/` path convention | Reads and writes canonical scripts |
| Draft State Store | Validation Adapter | Holds in-memory drafts |
| Codex Panel | Codex App Server Client, Action Approval Controller, Draft State Store | Main AI interaction surface |
| Codex App Server Client | Codex App Server | Direct renderer-side connection |
| Action Approval Controller | Script Repository Adapter, Command Runner, Draft State Store | Executes only approved proposals |
| JSON Review UI | Draft State Store, Validation Adapter | Raw and structured review |
| Scene Editor | Draft State Store, Asset Manager | Edits script scenes |
| Asset Manager | Electron file dialog and file bridge | Copies visuals into public assets |
| Validation Adapter | Existing schema and validation command | Draft and active-script validation |
| Command Runner | Electron main process, npm scripts | Runs long-running operations |
| Log Panel | Command Runner, Codex Panel | Displays and shares logs |
| Preview Panel | Workspace Controller, Command Runner, Remotion composition | Embedded preview target |

## Communication Patterns

### Renderer to Electron Main

- Used for local file dialogs.
- Used for copying visual assets.
- Used for running npm commands.
- Used for opening output files or fallback preview if needed.

### Renderer to Codex App Server

- Used for chat messages.
- Used for streamed Codex responses.
- Used for Codex action and JSON proposal events.

### GUI State to Existing Project Files

- Active script is saved only to `input/{videoId}.json`.
- Visual assets are copied to `public/visuals/{videoId}/`.
- Generated audio, manifests, timelines, and MP4 outputs remain in current folders.

## Data Flow: Idea to Applied Script

1. User enters a video idea in Codex Panel.
2. Codex App Server Client sends message and receives streamed response.
3. Codex Panel detects a JSON draft proposal.
4. Draft State Store stores draft in memory.
5. JSON Review UI displays draft.
6. Validation Adapter validates draft.
7. User approves application.
8. Script Repository Adapter writes `input/{videoId}.json`.
9. Workspace Controller marks active script as updated.

## Data Flow: Script to Render

1. User clicks a command button or approves a Codex action.
2. Action Approval Controller allows execution if needed.
3. Command Runner invokes existing npm script.
4. Command logs stream to Log Panel.
5. Workspace Controller refreshes artifact status.
6. Preview Panel updates preview or output state.

## Key Coupling Decisions

- GUI is coupled to existing npm command names for MVP.
- Canonical video schema stays shared with existing code.
- Codex protocol details are isolated in Codex App Server Client.
- Preview embedding remains isolated in Preview Panel so fallback can be used if needed.


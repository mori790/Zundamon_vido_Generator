# Components: GUI with Embedded Codex Panel

## Design Assumptions

- GUI form: Electron desktop app.
- UI stack: React renderer inside Electron.
- Runtime boundary: Electron main process handles local OS/file/process operations.
- Existing generation integration: GUI invokes existing npm scripts for MVP.
- Codex integration: GUI renderer communicates directly with Codex App Server.
- Draft persistence: JSON drafts and chat-derived proposal state are memory-only in MVP until the user applies a script.
- Preview: GUI-embedded preview is the primary target.

## Component List

### C1: Electron App Shell

- **Purpose**: Host the desktop application and coordinate renderer, main process, menus, and window lifecycle.
- **Responsibilities**:
  - Start the main application window.
  - Expose controlled local capabilities to the renderer.
  - Keep the GUI desktop-oriented while preserving local project file access.
- **Interfaces**:
  - Renderer IPC bridge.
  - File dialog bridge.
  - Process execution bridge.

### C2: Workspace Controller

- **Purpose**: Manage the currently opened single video workspace.
- **Responsibilities**:
  - Track the active `videoId`.
  - Load existing script state from `input/{videoId}.json`.
  - Track generated artifact readiness for audio, timeline, preview, and output.
  - Coordinate active script and in-memory draft state.
- **Interfaces**:
  - Script Repository.
  - Draft State Store.
  - Command Runner.

### C3: Script Repository Adapter

- **Purpose**: Read and write canonical script JSON files.
- **Responsibilities**:
  - Load `input/{videoId}.json`.
  - Save approved scripts to `input/{videoId}.json`.
  - Preserve compatibility with existing CLI commands.
  - Surface read/write errors.
- **Interfaces**:
  - Existing filesystem paths.
  - Existing schema validation.

### C4: Draft State Store

- **Purpose**: Hold Codex-generated and user-edited draft JSON before application.
- **Responsibilities**:
  - Store draft JSON in memory.
  - Track draft status: `none`, `draft`, `reviewing`, `invalid`, `applied`, `discarded`.
  - Keep active script separate from draft script.
  - Discard drafts without changing files.
- **Interfaces**:
  - Codex Panel.
  - JSON Review UI.
  - Scene Editor.
  - Validation Adapter.

### C5: Codex Panel

- **Purpose**: Provide chat-based planning and revision inside the production app.
- **Responsibilities**:
  - Display conversation messages.
  - Send creator prompts to Codex App Server.
  - Receive assistant responses and action proposals.
  - Present inline approval buttons for proposed actions.
  - Pass JSON draft proposals to Draft State Store.
- **Interfaces**:
  - Codex App Server Client.
  - Action Approval Controller.
  - Draft State Store.

### C6: Codex App Server Client

- **Purpose**: Encapsulate direct renderer-side communication with Codex App Server.
- **Responsibilities**:
  - Manage connection and authentication state.
  - Send chat input.
  - Receive streamed responses and structured events.
  - Convert Codex events into GUI-friendly message, draft, log, or action proposal events.
- **Interfaces**:
  - Codex App Server protocol.
  - Codex Panel event model.

### C7: Action Approval Controller

- **Purpose**: Ensure Codex cannot apply changes or run commands without creator approval.
- **Responsibilities**:
  - Represent proposed actions from Codex.
  - Render inline approval controls inside Codex messages.
  - Dispatch approved actions to the correct service.
  - Mark actions as approved, rejected, completed, or failed.
- **Interfaces**:
  - Codex Panel.
  - Script Repository Adapter.
  - Command Runner.
  - Draft State Store.

### C8: JSON Review UI

- **Purpose**: Let the creator inspect and edit generated JSON drafts.
- **Responsibilities**:
  - Display raw JSON editor.
  - Display structured scene review.
  - Switch between both views without losing state.
  - Show validation status and schema errors.
  - Apply or discard drafts.
- **Interfaces**:
  - Draft State Store.
  - Validation Adapter.
  - Script Repository Adapter.

### C9: Scene Editor

- **Purpose**: Provide direct editing of scene-level content.
- **Responsibilities**:
  - Add, remove, reorder, and edit scenes.
  - Edit text, scene type, emotion, visual config, and character visibility.
  - Send edits to draft or active script state depending on mode.
- **Interfaces**:
  - Draft State Store.
  - Workspace Controller.
  - Asset Manager.

### C10: Asset Manager

- **Purpose**: Manage visual image selection and public path assignment.
- **Responsibilities**:
  - Open local file picker.
  - Copy selected images to `public/visuals/{videoId}/`.
  - Generate script-compatible public paths.
  - Mark scenes with missing or valid visual assets.
- **Interfaces**:
  - Electron file dialog bridge.
  - File operation bridge.
  - Scene Editor.
  - Validation Adapter.

### C11: Validation Adapter

- **Purpose**: Expose existing validation behavior to the GUI.
- **Responsibilities**:
  - Validate active script or draft script.
  - Normalize schema, asset, and path errors for display.
  - Block apply or generation when validation fails.
- **Interfaces**:
  - Existing `npm run validate -- {videoId}` for active scripts.
  - In-memory schema validation for drafts.

### C12: Command Runner

- **Purpose**: Run existing generation commands and stream status to the GUI.
- **Responsibilities**:
  - Execute validation, voice, timeline, preview, and render commands.
  - Stream stdout and stderr to Log Panel.
  - Track command status.
  - Prevent conflicting long-running operations.
- **Interfaces**:
  - Electron main process process execution.
  - Existing npm scripts.
  - Log Panel.

### C13: Log Panel

- **Purpose**: Display command and integration logs.
- **Responsibilities**:
  - Append logs in order.
  - Show operation status.
  - Surface failures with actionable context.
  - Provide logs to Codex for diagnosis when the creator asks.
- **Interfaces**:
  - Command Runner.
  - Codex Panel.

### C14: Preview Panel

- **Purpose**: Show the current video preview inside the GUI.
- **Responsibilities**:
  - Render or embed a Remotion preview experience.
  - Detect stale audio or timeline data.
  - Show fallback guidance if embedded preview is unavailable.
- **Interfaces**:
  - Workspace Controller.
  - Command Runner.
  - Existing Remotion composition.


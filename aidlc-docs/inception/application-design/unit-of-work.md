# Units of Work: GUI with Embedded Codex Panel

## Decomposition Summary

The GUI is a single Electron desktop application. Units are logical implementation modules inside that app, not independently deployable services.

The decomposition uses fine-grained units because the selected MVP should support incremental vertical slices. The first implementation slice should open a video ID, connect to Codex, discuss a plan, and show a JSON draft.

## Recommended Implementation Order

1. U1: Electron App Shell and Workspace Foundation.
2. U2: Codex App Server Connection.
3. U3: JSON Draft Review and Scene Editing.
4. U4: Codex Proposal and Approval Flow.
5. U5: Asset Selection and Visual Attachment.
6. U6: Command Runner and Log Panel.
7. U7: Embedded Remotion Preview.
8. U8: Render Workflow and CLI Compatibility Verification.

## U1: Electron App Shell and Workspace Foundation

- **Priority**: Must.
- **Purpose**: Establish the desktop app and single-video workspace.
- **Responsibilities**:
  - Start Electron main and React renderer.
  - Open or create a single video workspace by video ID.
  - Load existing `input/{videoId}.json` when present.
  - Track active script and artifact readiness state.
  - Expose controlled IPC for file and process operations.
- **Primary Components**:
  - Electron App Shell.
  - Workspace Controller.
  - Script Repository Adapter.
- **Deliverables**:
  - Desktop app opens.
  - Video ID workspace loads.
  - Existing script can be read without breaking CLI compatibility.

## U2: Codex App Server Connection

- **Priority**: Must.
- **Purpose**: Enable chat-based planning with Codex.
- **Responsibilities**:
  - Connect GUI renderer directly to Codex App Server.
  - Surface authentication and connection state.
  - Send creator messages and receive streamed Codex responses.
  - Keep non-Codex UI usable if Codex is unavailable.
- **Primary Components**:
  - Codex Panel.
  - Codex App Server Client.
- **Deliverables**:
  - Creator can discuss a video idea.
  - Codex connection failures are visible and recoverable.

## U3: JSON Draft Review and Scene Editing

- **Priority**: Must.
- **Purpose**: Let the creator review and edit generated or manual script drafts before applying them.
- **Responsibilities**:
  - Store draft JSON in memory.
  - Show raw JSON and structured scene views.
  - Add, remove, reorder, and edit scenes.
  - Validate drafts before application.
  - Apply approved JSON to `input/{videoId}.json`.
- **Primary Components**:
  - Draft State Store.
  - JSON Review UI.
  - Scene Editor.
  - Validation Adapter.
  - Script Repository Adapter.
- **Deliverables**:
  - Drafts are not saved until approved.
  - Active scripts remain compatible with existing schema and CLI commands.

## U4: Codex Proposal and Approval Flow

- **Priority**: Must.
- **Purpose**: Turn Codex output into reviewable drafts and approved actions.
- **Responsibilities**:
  - Detect JSON draft proposals from Codex.
  - Register proposed save or command actions.
  - Show inline approval buttons in Codex messages.
  - Prevent unapproved file changes and command execution.
  - Route approved actions to draft, script, or command services.
- **Primary Components**:
  - Codex Panel.
  - Action Approval Controller.
  - Draft State Store.
  - Command Runner.
- **Deliverables**:
  - Codex can help, but creator remains in control.
  - Proposed actions have clear states: pending, approved, rejected, completed, failed.

## U5: Asset Selection and Visual Attachment

- **Priority**: Must.
- **Purpose**: Let the creator attach local images to scenes without manual path work.
- **Responsibilities**:
  - Open local image selection dialog.
  - Copy selected image files into `public/visuals/{videoId}/`.
  - Generate public paths for script JSON.
  - Attach visual references to scenes.
  - Mark missing or invalid assets.
- **Primary Components**:
  - Asset Manager.
  - Scene Editor.
  - Validation Adapter.
- **Deliverables**:
  - Scene visuals can be selected and validated in the GUI.

## U6: Command Runner and Log Panel

- **Priority**: Must.
- **Purpose**: Run existing npm commands from the GUI and display logs.
- **Responsibilities**:
  - Run validate, voice, timeline, preview, and render operations.
  - Stream stdout and stderr.
  - Display operation status.
  - Prevent conflicting long-running operations.
  - Provide logs to Codex when the creator asks for diagnosis.
- **Primary Components**:
  - Command Runner.
  - Log Panel.
  - Electron App Shell.
- **Deliverables**:
  - Existing generation pipeline is usable without terminal switching.

## U7: Embedded Remotion Preview

- **Priority**: Should.
- **Purpose**: Preview the current video inside the GUI.
- **Responsibilities**:
  - Embed or host a Remotion preview surface.
  - Detect stale preview data.
  - Refresh preview after generation changes.
  - Provide fallback path if embedded preview is blocked.
- **Primary Components**:
  - Preview Panel.
  - Workspace Controller.
  - Command Runner.
- **Deliverables**:
  - Creator can inspect video timing and layout from the GUI.

## U8: Render Workflow and CLI Compatibility Verification

- **Priority**: Must.
- **Purpose**: Ensure the GUI can produce MP4 output while preserving existing CLI behavior.
- **Responsibilities**:
  - Execute render from GUI.
  - Show output path and render failures.
  - Verify CLI commands still work with GUI-created files.
  - Validate end-to-end project folder compatibility.
- **Primary Components**:
  - Command Runner.
  - Log Panel.
  - Script Repository Adapter.
  - Workspace Controller.
- **Deliverables**:
  - MP4 output can be generated.
  - CLI remains a supported fallback.

## Code Organization Strategy

This is a brownfield single-package project. A later implementation should keep app code in the workspace root and avoid placing application code under `aidlc-docs/`.

Likely future organization:

- `src/studio/renderer/` for React GUI components.
- `src/studio/main/` for Electron main process and IPC.
- `src/studio/shared/` for GUI state and event types.
- Existing `src/core/`, `src/schemas/`, and `src/types/` remain shared generation logic.
- Existing `scripts/` remain CLI entry points.


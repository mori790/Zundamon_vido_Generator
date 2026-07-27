# Services: GUI with Embedded Codex Panel

## Service Layer Overview

The GUI application is organized around orchestration services rather than rewriting the existing generation pipeline. The existing CLI commands remain the MVP execution boundary.

## S1: Project Workspace Service

- **Purpose**: Coordinates the single-video project lifecycle.
- **Responsibilities**:
  - Open or create a video workspace.
  - Load active script.
  - Track active script, draft state, and generated artifact readiness.
  - Notify UI panels when project state changes.
- **Primary Components**:
  - Workspace Controller.
  - Script Repository Adapter.
  - Draft State Store.
  - Command Runner.

## S2: Codex Conversation Service

- **Purpose**: Manages planning chat and Codex-generated proposals.
- **Responsibilities**:
  - Connect to Codex App Server.
  - Send user messages with current project context.
  - Receive chat responses, JSON proposals, and action proposals.
  - Route proposals to draft review or approval UI.
- **Primary Components**:
  - Codex Panel.
  - Codex App Server Client.
  - Action Approval Controller.
  - Draft State Store.

## S3: Draft Review Service

- **Purpose**: Manages in-memory script proposals before application.
- **Responsibilities**:
  - Accept Codex-generated JSON.
  - Accept manual edits from raw or structured views.
  - Validate drafts.
  - Apply approved drafts to canonical script files.
  - Discard rejected drafts without touching files.
- **Primary Components**:
  - Draft State Store.
  - JSON Review UI.
  - Scene Editor.
  - Validation Adapter.
  - Script Repository Adapter.

## S4: Asset Workflow Service

- **Purpose**: Handles image selection and scene attachment.
- **Responsibilities**:
  - Open image picker.
  - Copy selected images under `public/visuals/{videoId}/`.
  - Produce public paths for script references.
  - Attach visuals to scenes.
  - Surface missing asset checks.
- **Primary Components**:
  - Asset Manager.
  - Scene Editor.
  - Validation Adapter.

## S5: Production Command Service

- **Purpose**: Runs the existing production commands through the GUI.
- **Responsibilities**:
  - Run validation, voice generation, timeline generation, preview, and render commands.
  - Stream logs and final status.
  - Prevent conflicting operations.
  - Return useful error states to GUI and Codex.
- **Primary Components**:
  - Command Runner.
  - Log Panel.
  - Workspace Controller.

## S6: Preview Service

- **Purpose**: Provides the preview experience.
- **Responsibilities**:
  - Load embedded preview when render data is available.
  - Detect stale or missing artifacts.
  - Trigger fallback preview launch if embedded preview is unavailable.
- **Primary Components**:
  - Preview Panel.
  - Workspace Controller.
  - Command Runner.

## S7: Approval Service

- **Purpose**: Enforces user control over Codex-proposed file and command actions.
- **Responsibilities**:
  - Register proposed actions.
  - Display inline approval controls.
  - Execute only approved actions.
  - Record action result state.
- **Primary Components**:
  - Action Approval Controller.
  - Codex Panel.
  - Script Repository Adapter.
  - Command Runner.

## Orchestration Examples

### Planning to Applied JSON

1. Creator sends prompt in Codex Panel.
2. Codex App Server Client streams response.
3. Codex proposes JSON draft.
4. Draft State Store stores draft in memory.
5. JSON Review UI displays raw and structured views.
6. Validation Adapter validates draft.
7. Creator approves apply action.
8. Script Repository Adapter saves `input/{videoId}.json`.

### Active Script to MP4

1. Creator clicks render or approves Codex-proposed render action.
2. Action Approval Controller confirms permission if action came from Codex.
3. Command Runner runs existing npm script.
4. Log Panel displays logs.
5. Workspace Controller refreshes generated artifact status.
6. Preview Panel or output path updates after success.

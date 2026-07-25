# Application Design: GUI with Embedded Codex Panel

## Summary

The proposed GUI is an Electron desktop application with a React renderer. It sits above the existing Zundamon Video Generator CLI and Remotion pipeline. The MVP uses existing npm commands for validation, voice generation, timeline generation, preview, and rendering. Codex App Server is connected directly from the GUI renderer, with action approval handled inside Codex messages.

## Core Design Decisions

- **Desktop shell**: Electron.
- **UI**: React.
- **Local execution**: Electron main process runs npm commands and local file operations.
- **Codex connection**: Renderer directly connects to Codex App Server.
- **Draft persistence**: Draft JSON and chat-derived proposals are memory-only until applied.
- **Approval UI**: Inline approval buttons in Codex messages.
- **Preview**: GUI-embedded Remotion preview is the main target.
- **CLI compatibility**: Existing npm commands and project folders remain intact.

## Primary Components

- Electron App Shell.
- Workspace Controller.
- Script Repository Adapter.
- Draft State Store.
- Codex Panel.
- Codex App Server Client.
- Action Approval Controller.
- JSON Review UI.
- Scene Editor.
- Asset Manager.
- Validation Adapter.
- Command Runner.
- Log Panel.
- Preview Panel.

## Service Boundaries

- **Project Workspace Service**: Coordinates active video project state.
- **Codex Conversation Service**: Handles planning chat and Codex proposals.
- **Draft Review Service**: Manages draft JSON, validation, application, and discard.
- **Asset Workflow Service**: Handles visual selection and scene attachment.
- **Production Command Service**: Runs existing npm commands and streams logs.
- **Preview Service**: Provides embedded preview and fallback behavior.
- **Approval Service**: Ensures Codex-proposed changes and commands require explicit approval.

## Important Constraints

- Codex-generated JSON must remain unapplied until approved.
- Active scripts must stay compatible with `input/{videoId}.json`.
- Existing CLI commands must continue to work.
- Long-running operations must report status and logs.
- Memory-only draft storage means unapplied drafts can be lost on app quit. This is acceptable for MVP based on the selected design, but should be revisited after the first usable version.

## Key Risks

- Direct renderer-to-Codex connection may need revision if authentication, protocol, or desktop security constraints require a main-process or backend adapter.
- Embedded Remotion preview may be more complex than command-based preview.
- npm command orchestration is pragmatic for MVP but less precise than directly calling core services.
- Memory-only drafts reduce persistence complexity but increase risk of losing uncommitted AI proposals.

## Artifact References

- `components.md` defines component responsibilities.
- `component-methods.md` defines high-level method signatures.
- `services.md` defines service orchestration.
- `component-dependency.md` defines communication and dependency patterns.


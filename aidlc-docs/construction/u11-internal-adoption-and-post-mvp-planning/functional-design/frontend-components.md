# U11 Frontend and User-Facing Components

## Current U11 User-Facing Surfaces

U11 changes user-facing documentation and CLI reporting, not Electron Renderer runtime UI.

### README Desktop Entry

- **Audience**: Internal non-developer user.
- **State**:
  - Has ZIP and SHA-256.
  - Has or does not have VOICEVOX.
  - First Run Workspace selected or not selected.
- **Interactions**:
  - Read introduction.
  - Verify ZIP.
  - Launch app.
  - Select empty Workspace.
  - Run sample-video smoke.
  - Use troubleshooting links when blocked.
- **Validation**:
  - Must not imply public release readiness.
  - Must not place CLI-first or developer-first content before Desktop path.
  - Must keep command examples copyable.

### Clean-Profile Smoke Checklist

- **Audience**: Internal non-developer user and supporting developer.
- **State**:
  - Step status: Pass, Fail, Blocked, Not Run.
  - VOICEVOX available or unavailable.
  - Evidence path available or not available.
- **Interactions**:
  - Execute required smoke steps in order.
  - Record minimum smoke result.
  - Execute optional additional checks separately.
- **Validation**:
  - Minimum smoke excludes optional diagnosis/editing/update checks.
  - VOICEVOX unavailable path is separated as developer-assisted.
  - Clean-profile result remains Not Run until actually executed.

### Acceptance Evidence Template

- **Audience**: Internal user and release owner.
- **State**:
  - Environment metadata.
  - Artifact metadata.
  - Step-level result.
  - Failure/retest fields.
- **Interactions**:
  - Fill metadata.
  - Attach sanitized evidence references.
  - Record failure, workaround, and retest.
- **Validation**:
  - Prefer relative paths and short descriptions.
  - Allow redacted absolute paths only when necessary.
  - Warn against credentials, tokens, personal information, and unnecessary absolute paths.

### Preflight CLI Report

- **Audience**: Developer/release owner.
- **State**:
  - Required checks pending, passed, failed, blocked, or not run.
  - Overall result passed or failed.
- **Interactions**:
  - Run one npm command.
  - Read Japanese summary.
  - Follow action guidance on failure.
- **Validation**:
  - Any failed required check returns non-zero.
  - Missing artifact instructs local-acceptance generation first.
  - Output does not mutate Workspace or leak secrets.

## Future UI Specification Surfaces

These are specification-only in U11.

### Series Management UI

- **Future Location**: Start screen or Workspace-level navigation.
- **User Interactions**:
  - Create series.
  - Add existing video ID.
  - Reorder episodes.
  - Open a video in existing single-video workflow.
  - Delete series reference without deleting video files.
- **State and Validation**:
  - Ordered unique video IDs.
  - Invalid references rejected.
  - Changes saved only after explicit save.
  - 100 episodes remain usable.

### Template Library UI

- **Future Location**: Start screen or script creation flow.
- **User Interactions**:
  - Select built-in or Workspace template.
  - Fill placeholders.
  - Preview generated draft.
  - Apply through existing draft workflow.
- **State and Validation**:
  - Built-in templates read-only.
  - Workspace templates editable.
  - Missing/invalid placeholders rejected.
  - Active script never overwritten directly.

### Multiple Workspace UI

- **Future Location**: First Run and Start screen.
- **User Interactions**:
  - View recent Workspace references.
  - Add, rename, remove, and revalidate references.
  - Switch active Workspace.
- **State and Validation**:
  - Only one active Workspace.
  - Canonical path uniqueness.
  - Unsaved draft, running command, or active Codex turn requires confirmation.
  - Removing a reference does not delete Workspace contents.

## Accessibility and Usability Rules

- Documentation headings must support scanning.
- Commands must be shown in copyable code blocks during Code Generation.
- Required and optional checks must be visually and structurally separated.
- Future UI specs must require keyboard access, accessible names, visible status, and non-overlapping status messages.

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | User-facing surfaces avoid unsafe installation guidance, protect evidence data, and preserve future Main-mediated filesystem access. |
| Resiliency Baseline | Compliant | Surfaces distinguish failure, blocked, not-run, and retry paths with rollback and incident evidence hooks. |
| Property-Based Testing (Partial) | Compliant | Future UI specs identify underlying pure state and validation properties for later PBT. |

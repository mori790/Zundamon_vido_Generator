# Domain Entities: U3 JSON Draft Review and Scene Editing

## ActiveScript

- **Type**: `VideoScript | null`
- **Source**: `input/{videoId}.json`
- **Purpose**: Canonical saved script used by existing CLI and rendering pipeline.
- **Mutability**: Read-only inside the editor until Apply writes a new canonical version.

## ScriptDraft

- **Fields**:
  - `videoId: string`
  - `status: DraftStatus`
  - `rawJson: string`
  - `parsedScript: VideoScript | null`
  - `lastValidScript: VideoScript | null`
  - `validation: DraftValidationResult`
  - `updatedAt: string`
- **Purpose**: In-memory editable script proposal.
- **Persistence**: Not persisted as canonical script until Apply.

## DraftStatus

- `none`
- `readonly-active`
- `draft`
- `invalid`
- `applied`
- `discarded`

## DraftValidationResult

- **Fields**:
  - `status: "untested" | "valid" | "invalid"`
  - `errors: DraftValidationIssue[]`
- **Purpose**: UI-facing validation state for parse and schema failures.

## DraftValidationIssue

- **Fields**:
  - `code: string`
  - `message: string`
  - `path?: string`
  - `sceneId?: string`
- **Purpose**: Normalize JSON parse and Zod schema errors into displayable editor issues.

## EditableScene

- **Source Type**: `Scene`
- **Editable Fields in U3**:
  - `id`
  - `type`
  - `text`
  - `emotion`
  - `characterVisible`
  - `durationBeforeSpeech`
  - `durationAfterSpeech`
- **Read-only or Deferred Fields in U3**:
  - `visual`

## DraftViewMode

- `raw`
- `structured`

## ApplyResult

- **Variants**:
  - `{status: "applied"; script: VideoScript; backupPath: string; scriptPath: string}`
  - `{status: "failed"; error: DraftValidationIssue | FileWriteIssue}`
- **Purpose**: Communicate final Apply outcome to the workspace UI.

## FileWriteIssue

- **Fields**:
  - `code: "backup-failed" | "save-failed"`
  - `message: string`
  - `targetPath: string`
- **Purpose**: Distinguish backup failures from canonical save failures.

## Entity Relationships

- WorkspaceState owns one ActiveScript.
- WorkspaceState may own one ScriptDraft.
- ScriptDraft contains raw JSON and parsed script state.
- Structured editor edits ScriptDraft.parsedScript.
- Raw editor edits ScriptDraft.rawJson.
- Apply converts ScriptDraft into ActiveScript and writes it to the canonical path.

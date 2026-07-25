# Business Logic Model: U3 JSON Draft Review and Scene Editing

## Scope

U3 adds a draft review and scene editing surface to the Studio workspace. It manages `VideoScript` drafts separately from the active script loaded from `input/{videoId}.json`, lets the creator inspect and edit drafts in raw and structured views, validates drafts, and applies valid drafts only after explicit user action.

U3 does not parse Codex JSON proposals from chat, attach local image files, run validation commands, preview, generate audio, or render MP4. Those responsibilities remain in later units.

## User Decisions Applied

- Existing scripts open as read-only active scripts first.
- The user creates an editable draft explicitly.
- First structured editor supports core scene fields only.
- If raw JSON is invalid, the raw editor remains editable and the structured view freezes at the last valid draft.
- Applying a draft creates `input/{videoId}.json.bak` before overwriting the canonical script.
- New scene IDs use sequential IDs such as `scene-001`.
- U3 includes a direct Apply button.

## Core Workflow

1. User opens a workspace.
2. If an active script exists, the editor shows it in read-only review mode.
3. User clicks Create Draft.
4. Draft State Store deep-copies the active script into an editable draft.
5. If no active script exists, Create Draft initializes a minimal valid `VideoScript` for the current `videoId`.
6. User edits the draft through raw JSON or structured scene view.
7. Draft validation runs after meaningful edits and before Apply.
8. If the raw JSON becomes invalid, the raw view shows parse errors while structured view continues showing the last valid parsed draft.
9. User clicks Apply.
10. Script Repository Adapter writes a backup to `input/{videoId}.json.bak`.
11. Script Repository Adapter writes the formatted draft JSON to `input/{videoId}.json`.
12. Workspace Controller reloads active script state from the applied draft.
13. Draft status becomes `applied`.

## Draft Lifecycle

- `none`: No editable draft exists.
- `readonly-active`: Active script is visible but not editable as a draft.
- `draft`: Editable draft exists and is parseable.
- `invalid`: Raw JSON has parse or schema errors; Apply is disabled.
- `applied`: Draft has been saved to `input/{videoId}.json`.
- `discarded`: Draft was discarded without file changes.

## Data Flow

- Active script source: `input/{videoId}.json`.
- Draft script source: in-memory copy or newly initialized minimal script.
- Raw JSON state: formatted JSON text from draft, edited directly by user.
- Structured state: parsed `VideoScript` from the latest valid raw JSON or structured edits.
- Validation state: draft parse and schema result displayed in the editor.
- Apply output: `input/{videoId}.json.bak` and `input/{videoId}.json`.

## View Synchronization

- Structured edit updates parsed draft first, then regenerates formatted raw JSON.
- Raw edit updates raw JSON text first.
- If raw JSON parses and validates, parsed draft and structured view update.
- If raw JSON fails to parse or validate, raw error state updates and structured view remains at the last valid parsed draft.

## Business Boundaries

- Active script cannot be changed by typing in the read-only active view.
- Draft edits are local until Apply.
- Apply is the only U3 operation that writes to `input/{videoId}.json`.
- Discard never writes files.
- Backup creation is required before canonical overwrite.

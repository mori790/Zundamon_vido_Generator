# Frontend Components: U3 JSON Draft Review and Scene Editing

## Component Hierarchy

- `WorkspaceShell`
  - `WorkspaceHeader`
  - `ScriptReviewPanel`
    - `DraftToolbar`
    - `DraftStatusBanner`
    - `DraftViewTabs`
    - `RawJsonEditor`
    - `StructuredSceneEditor`
    - `ValidationIssueList`
  - `CodexPanel`

## ScriptReviewPanel

- **Purpose**: Main U3 surface for active script review and draft editing.
- **Inputs**:
  - `videoId`
  - `activeScript`
  - draft state controller
- **State**:
  - `draft`
  - `viewMode`
  - `selectedSceneId`
  - `applyInProgress`
  - `lastApplyResult`
- **Behavior**:
  - Shows active script as read-only when no draft exists.
  - Creates draft on explicit action.
  - Displays raw or structured view.
  - Shows validation state and Apply/Discard controls.

## DraftToolbar

- **Controls**:
  - Create Draft
  - Apply
  - Discard
- **Rules**:
  - Create Draft is visible when no draft exists.
  - Apply is enabled only for valid drafts.
  - Discard is enabled when a draft exists.

## DraftStatusBanner

- **Purpose**: Communicates whether the user is viewing active script, editable draft, invalid draft, applied draft, or empty workspace.
- **States**:
  - Active script read-only.
  - Draft editing.
  - Raw JSON invalid.
  - Draft applied.
  - Apply failed.

## DraftViewTabs

- **Modes**:
  - Raw JSON
  - Scenes
- **Behavior**:
  - Switching tabs does not discard state.
  - If raw JSON is invalid, Scenes tab remains based on last valid draft and shows stale-state notice.

## RawJsonEditor

- **Purpose**: Editable JSON text area.
- **Behavior**:
  - Updates `rawJson` on input.
  - Attempts parse and schema validation after edit.
  - Keeps user text even when invalid.
  - Shows parse/schema errors through `ValidationIssueList`.

## StructuredSceneEditor

- **Purpose**: Core scene editing form.
- **Displays**:
  - Ordered scene list.
  - Scene detail fields for selected scene.
- **Editable Fields**:
  - Scene ID.
  - Scene type.
  - Text.
  - Emotion.
  - Character visibility.
  - Before-speech duration.
  - After-speech duration.
- **Controls**:
  - Add Scene.
  - Remove Scene.
  - Move Up.
  - Move Down.
- **Behavior**:
  - Updates parsed draft.
  - Regenerates formatted raw JSON after valid structured edits.
  - Prevents removing the final scene.

## ValidationIssueList

- **Purpose**: Shows parse and schema issues.
- **Display Fields**:
  - Message.
  - Path if known.
  - Scene ID if known.
- **Behavior**:
  - Empty when draft is valid.
  - Visible near Apply controls and editor field region.

## Workspace Integration

- U3 expands the existing workspace placeholder into `ScriptReviewPanel`.
- `CodexPanel` remains present but does not yet inject proposals into Draft State Store.
- File operations remain renderer-accessed through the existing local file access pattern until IPC is tightened in a later unit.

## Testable Interactions

- Existing script opens read-only.
- Create Draft produces editable JSON.
- Invalid raw JSON disables Apply and preserves structured last-valid state.
- Structured scene edit updates raw JSON.
- Add/remove/reorder scene updates draft.
- Apply creates backup then writes canonical JSON.
- Discard leaves canonical script unchanged.

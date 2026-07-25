# Business Rules: U3 JSON Draft Review and Scene Editing

## Draft Creation Rules

- Existing workspace:
  - Initial display is read-only active script.
  - Create Draft copies the active script into an editable draft.
- Empty workspace:
  - Create Draft creates a minimal valid `VideoScript` with current `videoId`, a default title, default speaker/video/subtitle settings, and one starter explanation scene.
- Draft creation must not write to `input/`.

## Raw JSON Rules

- Raw JSON remains editable even when invalid.
- Invalid raw JSON disables Apply.
- Parse errors and schema errors must be visible.
- Structured view uses the last valid parsed draft while raw JSON is invalid.
- Valid raw JSON becomes the new parsed draft.
- Raw JSON should be formatted when generated from structured edits or initial draft creation.

## Structured Scene Editing Rules

- First implementation supports scene core fields:
  - `type`
  - `text`
  - `emotion`
  - `characterVisible`
  - `durationBeforeSpeech`
  - `durationAfterSpeech`
- Visual config editing is deferred from U3 first implementation.
- Speaker, video, and subtitle settings are deferred from U3 first implementation.
- Scene text must not be empty.
- Wait durations must be zero or positive.
- Scene type must be one of the supported `SceneType` values.
- Emotion must be one of the supported `Emotion` values.

## Scene List Rules

- Add Scene appends a new scene after the selected scene or at the end when no scene is selected.
- New scene IDs use the next unused sequential ID matching `scene-001`, `scene-002`, and so on.
- Removing a scene is blocked when it would leave the script with zero scenes.
- Reordering scenes changes order only; it does not renumber existing scene IDs.
- Duplicate scene IDs are invalid and block Apply.

## Validation Rules

- Validation runs:
  - After raw JSON becomes parseable.
  - After structured scene edits.
  - Before Apply.
- Validation uses the existing `videoScriptSchema`.
- Draft validation errors should identify the field path where possible.
- Asset existence checks are out of scope for this unit and remain command/asset workflow work.

## Apply Rules

- Apply is enabled only when:
  - A draft exists.
  - Raw JSON is parseable.
  - Parsed draft passes schema validation.
  - The draft `id` matches the workspace `videoId` or has been normalized before save.
- Apply writes `input/{videoId}.json.bak` before overwriting `input/{videoId}.json`.
- If backup creation fails, canonical script overwrite must not proceed.
- If canonical save fails after backup succeeds, the UI must show an error and keep the draft available.
- After successful Apply, active script updates to the applied draft.

## Discard Rules

- Discard removes the current draft state.
- Discard does not write any file.
- For existing workspaces, discard returns to read-only active script view.
- For empty workspaces, discard returns to an empty draft workspace with no active script.

## CLI Compatibility Rules

- Applied JSON must remain compatible with the current `input/{videoId}.json` contract.
- No GUI-only metadata may be written into the canonical script.
- U3 local draft state must remain outside `input/`.

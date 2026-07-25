# User Stories: GUI with Embedded Codex Panel

## Story Format

- **Persona**: P1 Individual Technical Video Creator.
- **Priority**: Must, Should, or Could.
- **Acceptance Criteria**: Given/When/Then format.
- **Requirement Mapping**: Functional and non-functional requirement IDs from `requirements.md`.

## Epic 1: Open a Single Video Workspace

### US-1: Open or create a single video project

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to open or create one video project in the GUI, **so that** I can manage planning, script review, assets, preview, and rendering in one workspace.

**Acceptance Criteria**

- Given the GUI is open, when I enter or select a video ID, then the app loads the matching project workspace.
- Given no script exists for the video ID, when I create the workspace, then the app starts with an empty or draft script state.
- Given a script exists in `input/{videoId}.json`, when I open the workspace, then the app displays the active script and current generated artifact status.

**Requirement Mapping**: FR-1, FR-12, NFR-1

### US-2: Preserve CLI compatibility

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** the GUI to use the same project files as the CLI, **so that** I can still run terminal commands when needed.

**Acceptance Criteria**

- Given the GUI applies a script, when I run `npm run validate -- {videoId}`, then the CLI can validate the same script.
- Given the GUI creates assets or generated files, when I inspect the workspace, then files remain in the existing `input/`, `public/`, `generated/`, and `output/` structure.
- Given I choose not to use the GUI, when I run existing npm commands, then the previous CLI workflow still works.

**Requirement Mapping**: FR-12, NFR-4

## Epic 2: Plan with Codex

### US-3: Discuss a video idea with Codex

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to discuss my video idea with Codex inside the GUI, **so that** I can shape the target audience, angle, structure, and tone before generating JSON.

**Acceptance Criteria**

- Given the Codex panel is available, when I describe a video idea, then Codex responds within the same workspace.
- Given my idea is incomplete, when Codex needs more context, then it asks clarifying questions or proposes reasonable options.
- Given I request a different tone or scope, when Codex revises the plan, then the updated proposal remains visible in the conversation.

**Requirement Mapping**: FR-2, FR-3, FR-11

### US-4: Handle Codex authentication or connection failure

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** the GUI to clearly show Codex connection or authentication failures, **so that** I can fix the issue without losing my video work.

**Acceptance Criteria**

- Given Codex App Server authentication is unavailable, when I open or use the Codex panel, then the GUI shows an actionable error state.
- Given the Codex connection drops, when I am editing a project, then the active script and local edits remain available.
- Given Codex is unavailable, when I continue manually, then non-Codex GUI functions remain usable where possible.

**Requirement Mapping**: FR-11, NFR-2, NFR-3

## Epic 3: Generate and Review JSON Drafts

### US-5: Generate a script JSON draft from the planning conversation

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** Codex to generate a `VideoScript` JSON draft from our planning conversation, **so that** I do not need to write the first version manually.

**Acceptance Criteria**

- Given a planning conversation exists, when I ask Codex to create JSON, then Codex produces a draft compatible with the current script schema.
- Given Codex produces a draft, when the GUI receives it, then the draft is marked as not applied.
- Given the draft has schema errors, when it is displayed, then validation errors are shown before application.

**Requirement Mapping**: FR-2, FR-3, FR-4, FR-5, NFR-2

### US-6: Review generated JSON in raw and structured views

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to switch between raw JSON and structured scene views, **so that** I can verify both technical validity and video content.

**Acceptance Criteria**

- Given a JSON draft exists, when I choose raw view, then the GUI displays editable JSON text.
- Given a JSON draft exists, when I choose structured view, then the GUI displays scenes with ID, type, text, emotion, visual, and timing details.
- Given I switch between views, when no changes are made, then the represented script remains consistent.

**Requirement Mapping**: FR-5, FR-6

### US-7: Ask Codex to revise a draft before applying it

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to request changes to a draft through Codex, **so that** the script matches my intent before it becomes the active project file.

**Acceptance Criteria**

- Given a draft is visible, when I ask Codex to revise wording, scene count, tone, or structure, then Codex returns an updated draft.
- Given a revised draft is generated, when I compare it to the previous draft, then the GUI makes clear that it is still unapplied.
- Given I reject a revision, when I discard it, then the active script remains unchanged.

**Requirement Mapping**: FR-2, FR-3, FR-4, NFR-2

### US-8: Apply an approved JSON draft

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to explicitly apply a reviewed JSON draft, **so that** only approved content is saved to `input/{videoId}.json`.

**Acceptance Criteria**

- Given a valid draft exists, when I click Apply, then the GUI saves it as the active script.
- Given a draft is invalid, when I attempt to apply it, then the GUI prevents application and shows validation errors.
- Given a draft is applied, when I reload the project, then the active script matches the applied draft.

**Requirement Mapping**: FR-4, FR-8, NFR-2, NFR-5

## Epic 4: Edit Scenes and Assets

### US-9: Edit scenes directly in the GUI

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to add, remove, reorder, and edit scenes directly, **so that** I can make precise changes without asking Codex for every edit.

**Acceptance Criteria**

- Given an active or draft script is loaded, when I add a scene, then the scene appears in the ordered scene list.
- Given a scene exists, when I edit text, type, emotion, visual config, or character visibility, then the GUI updates the script state.
- Given I make an invalid edit, when validation runs, then the GUI identifies the affected field or scene.

**Requirement Mapping**: FR-6, NFR-5

### US-10: Select and attach image assets

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to choose image files and attach them to scenes, **so that** explanation visuals can be included without manually managing paths.

**Acceptance Criteria**

- Given I select an image file, when I attach it to a scene, then the file is placed under `public/visuals/{videoId}/`.
- Given an image is attached, when the script is saved, then the scene references the asset with a public path.
- Given a referenced image is missing, when validation runs, then the GUI shows which scene and path are affected.

**Requirement Mapping**: FR-7, NFR-5

### US-11: Handle missing asset failures

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** missing visual assets to be shown clearly, **so that** I can fix them before preview or render.

**Acceptance Criteria**

- Given a script references a missing asset, when I validate the project, then the GUI shows the scene ID and missing path.
- Given a missing asset exists in a scene, when I open the structured scene view, then the scene is marked as needing attention.
- Given I replace the missing asset, when validation runs again, then the error is cleared.

**Requirement Mapping**: FR-7, FR-9, NFR-5

## Epic 5: Validate, Preview, and Render

### US-12: Validate the active script from the GUI

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to run validation from the GUI, **so that** I can detect JSON and asset problems before generation.

**Acceptance Criteria**

- Given an active script exists, when I run validation, then the GUI reports success or specific validation errors.
- Given the script has invalid JSON or schema violations, when validation runs, then the GUI identifies the relevant issue.
- Given validation fails, when I attempt voice generation or rendering, then the GUI warns me before continuing.

**Requirement Mapping**: FR-8, FR-9, NFR-5

### US-13: Generate voice and timeline artifacts

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to generate voices and timelines from the GUI, **so that** I can prepare the video for preview and render without using the terminal.

**Acceptance Criteria**

- Given the active script is valid and VOICEVOX is running, when I start voice generation, then WAV files are generated or reused from cache.
- Given voice generation finishes, when timeline generation runs, then `generated/timelines/{videoId}.timeline.json` is updated.
- Given generation is running, when I watch the GUI, then progress or logs indicate the current operation.

**Requirement Mapping**: FR-8, FR-9, NFR-3

### US-14: Handle VOICEVOX not running

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** VOICEVOX connection failures to be explained clearly, **so that** I know how to recover.

**Acceptance Criteria**

- Given VOICEVOX is not running, when I start voice generation, then the GUI shows that VOICEVOX Engine cannot be reached.
- Given the connection target is configured, when the error appears, then the GUI shows the attempted connection URL.
- Given I start VOICEVOX and retry, when the connection succeeds, then voice generation can continue.

**Requirement Mapping**: FR-9, NFR-3

### US-15: Preview the current video inside the GUI

**Priority**: Should  
**Persona**: P1  
**As a** technical video creator, **I want** to preview the video inside the GUI, **so that** I can check timing, subtitles, assets, and character display without switching tools.

**Acceptance Criteria**

- Given valid render data exists, when I open preview, then the GUI displays the video preview.
- Given preview data is stale, when I request preview, then the GUI tells me what needs regeneration.
- Given embedded preview is unavailable, when I start preview, then the GUI can fall back to launching Remotion Studio.

**Requirement Mapping**: FR-10, NFR-3

### US-16: Render MP4 from the GUI

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** to render MP4 from the GUI, **so that** the final output can be produced from the same app.

**Acceptance Criteria**

- Given the active script and generated artifacts are ready, when I start render, then the GUI runs the render operation.
- Given render succeeds, when the operation finishes, then the GUI shows the output path.
- Given render fails, when the error is returned, then the GUI displays the failure message and relevant logs.

**Requirement Mapping**: FR-8, FR-9, NFR-3

### US-17: Monitor logs for long-running operations

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** logs and operation states visible in the GUI, **so that** I understand what is happening during validation, generation, preview, and rendering.

**Acceptance Criteria**

- Given an operation starts, when it is running, then the GUI shows an active state.
- Given logs are produced, when the operation continues, then the GUI appends log output in order.
- Given the operation finishes, when it succeeds or fails, then the GUI shows a terminal status.

**Requirement Mapping**: FR-9, NFR-3

## Epic 6: Codex-Guided Approved Actions

### US-18: Approve Codex-proposed production actions

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** Codex to propose actions but wait for approval, **so that** I stay in control of file changes and generation commands.

**Acceptance Criteria**

- Given Codex proposes saving JSON, when I have not approved, then no active script file is changed.
- Given Codex proposes validation, voice generation, preview, or render, when I have not approved, then no command runs.
- Given I approve a Codex-proposed action, when the action starts, then the GUI displays the running operation and logs.

**Requirement Mapping**: FR-8, NFR-2, NFR-5

### US-19: Recover from render failures

**Priority**: Must  
**Persona**: P1  
**As a** technical video creator, **I want** render failures to include useful context, **so that** I can ask Codex for help or fix the project manually.

**Acceptance Criteria**

- Given rendering fails, when the GUI receives the failure, then it displays a clear error state.
- Given render logs exist, when I view the failure, then the GUI shows the relevant logs.
- Given I ask Codex to diagnose the failure, when Codex has access to the logs, then it can propose next steps without automatically changing files.

**Requirement Mapping**: FR-2, FR-9, NFR-3

### US-20: Continue manually when Codex is unavailable

**Priority**: Should  
**Persona**: P1  
**As a** technical video creator, **I want** core editing and generation controls to remain usable when Codex is unavailable, **so that** I can continue production manually.

**Acceptance Criteria**

- Given Codex authentication fails, when I open the project, then scene editing and validation remain available.
- Given Codex connection is unavailable, when I use generation controls, then GUI operations that do not require Codex still work.
- Given Codex returns later, when I reconnect, then the current project state remains intact.

**Requirement Mapping**: FR-6, FR-9, FR-11, NFR-2

## Priority Summary

| Priority | Stories |
|---|---|
| Must | US-1, US-2, US-3, US-4, US-5, US-6, US-7, US-8, US-9, US-10, US-11, US-12, US-13, US-14, US-16, US-17, US-18, US-19 |
| Should | US-15, US-20 |
| Could | None in MVP |

## INVEST Notes

- Stories are user-visible and individually testable.
- Some stories depend on the single-video workspace foundation, but each preserves a distinct user value.
- Larger technical concerns such as Codex App Server transport, embedded preview implementation, and command orchestration are intentionally left for design stages.


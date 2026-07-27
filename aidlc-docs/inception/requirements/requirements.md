# Requirements: GUI with Embedded Codex Panel

## Intent Analysis

- **User Request**: Add a video production GUI to Zundamon Video Generator with an embedded Codex panel. The GUI should let the creator consult with Codex during planning, review AI-generated JSON, manage assets, preview, and render videos.
- **Request Type**: New user-facing feature on an existing local CLI and Remotion application.
- **Scope Estimate**: Multiple components. The feature affects project/session state, script editing, Codex App Server integration, asset handling, preview, command execution, and logs.
- **Complexity Estimate**: Complex. It combines local file operations, long-running media generation, user approval gates, AI proposal review, and GUI interaction design.
- **Chosen Product Direction**: A video production application is the primary experience. Codex is embedded as a consultation and automation panel, not the only interface.

## Current System Context

The existing MVP is a local TypeScript and Remotion CLI application. It already supports:

- Loading `input/{videoId}.json`.
- Validating script JSON and referenced assets.
- Generating VOICEVOX audio.
- Caching generated WAV files.
- Generating timelines.
- Rendering MP4 through Remotion.
- Running preview and generation through npm scripts.

The GUI should sit above this existing pipeline. It should reuse the current script JSON contract and generation services rather than replacing the CLI pipeline.

## Functional Requirements

### FR-1: Single Video Project Workspace

The MVP GUI shall focus on one video project at a time.

- The project unit is a single video ID.
- The workflow covers planning, JSON draft creation, review, validation, voice generation, preview, and MP4 output for that video.
- Series-level management and shared templates are future work.

### FR-2: Embedded Codex Panel

The GUI shall include a Codex panel as a persistent assistant area.

- The creator can discuss video ideas, target audience, story structure, tone, scene count, and explanations with Codex.
- Codex can produce structure proposals, script drafts, and valid `VideoScript` JSON drafts.
- Codex can revise the draft based on chat feedback.
- The GUI remains the main production surface; Codex is an assistant inside it.

### FR-3: Chat-Driven Planning Flow

The GUI shall support a planning flow where the creator and Codex iterate before JSON is applied.

Expected flow:

1. Creator describes the video idea.
2. Codex asks clarifying questions or proposes a structure.
3. Creator requests changes.
4. Codex generates a JSON draft.
5. GUI displays the draft for review.
6. Creator approves, edits, asks Codex for revision, or discards the draft.

### FR-4: JSON Draft Review

The GUI shall treat Codex-generated JSON as a draft until the creator explicitly applies it.

- Draft JSON must not immediately overwrite `input/{videoId}.json`.
- Drafts should have an explicit status such as `draft`, `reviewing`, or `applied`.
- The creator must have an `Apply` action before a draft becomes the active video script.
- The active script remains compatible with the existing `input/{videoId}.json` format.

### FR-5: Dual JSON Review Modes

The GUI shall let the creator inspect generated JSON in two ways.

- Raw JSON editor view.
- Structured scene review view showing scene ID, type, text, emotion, visual, and timing fields.
- The user can switch between both views.

### FR-6: Scene Editing

The GUI MVP shall include direct editing for a single video's scenes.

- Add, remove, reorder, and edit scenes.
- Edit scene text, type, emotion, visual configuration, and character visibility.
- Validate edited scene data before applying it.
- Preserve compatibility with the current Zod schema.

### FR-7: Asset Management

The GUI shall support basic image asset management.

- The creator can select image files from the local machine.
- Selected visuals are copied or placed into `public/visuals/{videoId}/`.
- The GUI can show whether referenced assets exist.
- The GUI can associate an image asset with a scene.

### FR-8: Codex Action Approval

Codex may propose file changes and generation actions, but execution requires explicit creator approval.

Allowed with approval:

- Save JSON to `input/{videoId}.json`.
- Run validation.
- Generate voices.
- Generate timeline.
- Start preview.
- Render MP4.

Codex should not silently apply destructive or project-changing operations.

### FR-9: Command Execution and Logs

The GUI shall expose generation commands and their results.

- Validate.
- Voice generation.
- Timeline generation.
- Preview.
- Render.

The GUI shall display progress and logs for long-running operations, including VOICEVOX errors and Remotion render errors.

### FR-10: Embedded Preview

The GUI MVP should target an embedded Remotion preview experience.

- The creator can preview the current video inside the GUI.
- The preview should reflect the active script and generated timeline/audio state.
- If embedded preview becomes a blocker, the fallback is to launch Remotion Studio from the GUI while keeping this requirement as the intended direction.

### FR-11: ChatGPT Managed Authentication

The preferred Codex integration shall use Codex App Server with ChatGPT managed authentication.

- The design should prioritize using the creator's ChatGPT/Codex subscription context where supported by App Server.
- API-key-based OpenAI integration is not an MVP priority.
- Authentication details should be isolated behind a Codex integration boundary.

### FR-12: Existing CLI Compatibility

The GUI shall not remove or break the existing CLI workflow.

- `npm run validate -- {videoId}` remains usable.
- `npm run voice -- {videoId}` remains usable.
- `npm run timeline -- {videoId}` remains usable.
- `npm run preview -- {videoId}` remains usable.
- `npm run video -- {videoId}` remains usable.

## Non-Functional Requirements

### NFR-1: Local-First Operation

The GUI shall operate as a local creator tool on macOS.

- Project files remain local.
- Generated assets remain under the existing workspace structure.
- VOICEVOX continues to run locally.

### NFR-2: Human Approval and Recoverability

AI-generated work shall be reviewable before it changes the active video script.

- Draft JSON must be recoverable or discardable.
- Applying a draft should be explicit.
- Validation errors must be visible before generation.

### NFR-3: Responsiveness

Long-running operations must not freeze the GUI.

- VOICEVOX generation and Remotion rendering run asynchronously.
- Logs and progress update while commands run.
- The user can see whether the app is idle, validating, generating, previewing, or rendering.

### NFR-4: Maintainability

The GUI should be layered above the existing pipeline.

- Existing core services should be reused where practical.
- Codex App Server integration should be isolated from rendering and validation logic.
- GUI state should be separate from canonical script JSON.

### NFR-5: Safety of File Operations

The GUI must avoid accidental overwrites and path mistakes.

- Generated drafts should not overwrite active scripts without approval.
- Asset paths should remain constrained to `public/` where referenced by video JSON.
- The GUI should present clear validation messages when files are missing.

### NFR-6: Testability

The MVP should keep tests focused on high-risk logic.

- Script draft state transitions.
- JSON draft validation and application.
- Asset path handling.
- Command orchestration behavior.
- Codex action approval boundaries.

Property-based testing is not required for MVP.

## Extension Configuration

Based on user answers:

- **Security Baseline**: Disabled. This is treated as a local personal-tool MVP rather than production-grade software.
- **Resiliency Baseline**: Disabled. Rapid local iteration is prioritized.
- **Property-Based Testing**: Disabled. Standard unit and integration tests are preferred for MVP.

## MVP Scope

The GUI MVP should include:

- Single-video workspace.
- Codex panel for planning, drafting, and revisions.
- Draft JSON review before application.
- Raw JSON and structured scene views.
- Scene editing for the active video.
- Basic image asset selection and placement.
- User-approved Codex actions.
- Validation, voice generation, timeline generation, preview, render controls.
- Log display.
- Embedded Remotion preview target, with Remotion Studio launch as fallback if embedding blocks progress.

## Out of Scope for MVP

- Multi-video series management.
- Template library.
- YouTube upload.
- Automatic thumbnail generation.
- API-key-based alternative AI provider setup.
- Fully autonomous Codex execution without approvals.
- Cloud collaboration or shared accounts.

## Key Risks and Open Design Points

- **Embedded Remotion Preview**: Desired for MVP, but may require architectural validation. A fallback preview launch path should be kept.
- **Codex App Server Integration**: Needs proof-of-concept around authentication, message streaming, approvals, and action execution.
- **Draft State Model**: The app needs a clear distinction between Codex proposals, draft JSON, and active saved script.
- **Long-Running Process Control**: Rendering, preview, and voice generation need progress and error propagation in the GUI.

## Acceptance Criteria

1. The creator can open a GUI for a single video project.
2. The creator can chat with Codex about video planning inside the GUI.
3. Codex can generate a `VideoScript` JSON draft.
4. The creator can review the generated JSON in raw and structured views.
5. The generated JSON is not applied until the creator approves it.
6. The creator can edit scenes in the GUI.
7. The creator can select image assets and attach them to scenes.
8. The creator can validate the active script from the GUI.
9. The creator can trigger voice generation, timeline generation, preview, and render from the GUI.
10. Logs and errors are visible in the GUI.
11. The existing CLI commands continue to work.


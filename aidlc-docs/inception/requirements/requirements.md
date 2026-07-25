# Requirements

## Intent Analysis

- **Project**: Zundamon Video Generator
- **Request Type**: New Project
- **Workspace Type**: Greenfield
- **Scope Estimate**: System-wide MVP implementation
- **Complexity Estimate**: Complex
- **Target Implementation Scope**: Full MVP, including priority A, B, and C items from the supplied specification
- **Target Platform**: macOS first, with future Linux portability in mind

## User Goal

The user wants a semi-automated video generation system for recurring Zundamon technical explanation videos. The system must read a user-authored script JSON, generate VOICEVOX narration, calculate scene timing from audio duration, render subtitles, character art, expressions, explanation assets, title and ending scenes, then output an MP4 video through Remotion.

## Confirmed Requirement Decisions

- Security Baseline extension: Disabled by user selection.
- Resiliency Baseline extension: Disabled by user selection.
- Property-Based Testing extension: Disabled by user selection.
- Initial implementation target: Full MVP from the supplied specification.
- Missing visual assets: Provide development placeholder images so the project can be verified before real assets are added.
- VOICEVOX fallback: No mock generation path. VOICEVOX Engine is required for voice generation and must fail clearly when unavailable.
- Test strategy: Unit tests plus lightweight integration tests.

## Functional Requirements

### Script Input

- The system must read one JSON script file from `input/{videoId}.json`.
- The script file name must match the requested video ID.
- The script must support video-level metadata: `id`, `title`, `description`, `speaker`, `video`, `subtitle`, and `scenes`.
- The script must support scene types: `title`, `explanation`, `code`, `summary`, and `ending`.
- The script must support emotions: `normal`, `happy`, `surprised`, and `troubled`.
- The script must support visual types: image, code, text, and none.
- The system must support the sample script shape supplied in the specification.

### Validation

- The system must validate required fields before generation.
- The system must stop on invalid or unsafe input.
- The system must detect duplicate scene IDs.
- The system must reject empty scene text.
- The system must reject unsupported emotions and visual types.
- The system must reject invalid numeric values such as non-positive width, height, or fps.
- The system must reject negative speech wait durations.
- The system must verify referenced visual files are under `public`.
- The system must prevent directory traversal in file references.
- The system must verify required character images exist, or use included development placeholders when the placeholder setup is active.
- The system must warn for long subtitles, missing optional visuals, missing description, missing BGM, missing title scene, and missing ending scene.

### VOICEVOX Integration

- The system must connect to VOICEVOX Engine at `VOICEVOX_BASE_URL`, defaulting to `http://localhost:50021`.
- The system must call `POST /audio_query` with `text` and `speaker`.
- The system must call `POST /synthesis` with the generated audio query and selected speaker.
- The system must override voice parameters from script configuration: speed, pitch, intonation, and volume.
- The system must write WAV files to `public/audio/{videoId}/{sceneId}.wav`.
- If VOICEVOX Engine is unavailable, the system must stop with the Japanese error message specified by the user.
- No mock VOICEVOX generation path is required for MVP runtime.

### Voice Cache

- The system must reuse generated voice files when the text and voice settings are unchanged.
- The cache key must be a SHA-256 hash of text, speaker ID, speed, pitch, intonation, and volume.
- The system must persist cache metadata in `generated/manifests/{videoId}.manifest.json`.
- The `--force` option must bypass the voice cache.
- Successfully generated partial audio files must not be deleted after a later failure.

### Audio Duration

- The system must measure WAV duration in seconds.
- Audio duration must be used to calculate scene length, subtitle visibility, next scene start, and total video length.
- Default wait durations must be `durationBeforeSpeech = 0.2` seconds and `durationAfterSpeech = 0.3` seconds.

### Timeline Generation

- The system must generate a timeline file at `generated/timelines/{videoId}.timeline.json`.
- The timeline must include video ID, fps, total frames, and per-scene frame data.
- Frame values must be calculated as `seconds * fps` and rounded to the nearest integer.
- Each scene must include start frame, audio start frame, scene frame duration, audio frame duration, and audio path.

### Remotion Rendering

- The system must render a Remotion composition to MP4.
- Output must be written to `output/{videoId}.mp4`.
- The initial render target must be 1920 by 1080 at 30fps.
- Existing output files with the same name may be overwritten.
- Rendering failures must produce a clear Japanese error message.

### Video Composition

- The system must render title scenes, explanation scenes, code scenes, summary scenes, and ending scenes.
- The system must display subtitles synchronized to each scene's audio start and audio end.
- The system must place subtitles at the bottom center with readable white bold text and black outline.
- The system must split subtitles using Japanese punctuation, particles, approximate character length, then forced splitting as fallbacks.
- If subtitles exceed configured limits, the system must shrink font size, allow up to 3 lines, then warn.
- The system must display Zundamon character art in the lower-right by default.
- The system must switch character expression based on scene emotion.
- The system must implement simple lip sync by alternating open and closed mouth images during speech.
- The system must move the character slightly while speaking.
- The system must support background color or background image.
- The system must display image visuals with contain or cover fit.
- The system must display code visuals with file name, code body, line numbers, and syntax highlighting.
- The system must display text visuals as simple explanation content.
- The system must support optional BGM when configured.

### CLI

- `npm run video -- {videoId}` must validate input, check assets, confirm VOICEVOX, generate voices, measure audio, generate timeline, render video, and verify output.
- `npm run voice -- {videoId}` must generate voice files only.
- `npm run timeline -- {videoId}` must generate the timeline from existing/generated audio.
- `npm run validate -- {videoId}` must validate script and assets.
- `npm run preview -- {videoId}` must open Remotion preview for the selected video.
- `npm run video -- {videoId} --force` must force voice regeneration.

### Logging

- Logs must support INFO, WARN, and ERROR.
- Logs must identify video ID, scene ID, generated files, cache hits, warnings, and failure causes.
- User-facing error messages must be clear enough to identify the missing input, asset, VOICEVOX connection, voice generation issue, or rendering failure.

## Non-Functional Requirements

### Maintainability

- TypeScript types must define the input data model.
- Runtime validation must be implemented for JSON input.
- Voice generation, audio measurement, timeline generation, rendering orchestration, and Remotion drawing must be separated.
- Scene rendering must be componentized into React components.
- Character assets must be organized so future characters can be added without changing core scene logic.

### Reusability

- Per-video customization must primarily live in JSON and assets.
- Layout behavior must be shared across videos.
- Voice settings must be configurable at the video level and should allow scene-level override if implementation cost remains reasonable.

### Portability

- The MVP must run on macOS with Node.js.
- File and process handling should avoid macOS-only assumptions where practical so Linux support remains feasible.

### Performance

- Generated voice files must be cached.
- Re-running the same script must avoid regenerating unchanged voice files.
- The system must support approximately 10-minute videos without architectural changes.
- Voice generation may run sequentially for MVP.
- The design should allow future parallel voice generation.

### Security

- External input must not be directly interpolated into shell commands.
- Script-controlled file paths must be normalized and constrained.
- JSON-referenced files must be restricted to `public`.
- API keys or secrets must not be hardcoded.

### Testability

- Unit tests are required for JSON validation, subtitle line breaking, seconds-to-frame conversion, timeline calculation, cache hash generation, file existence checks, and character image selection.
- Lightweight integration tests are required for VOICEVOX connection behavior and timeline generation flow.
- Full MP4 E2E tests are not required as a blocking MVP test, but build-and-test documentation should describe how to run one manually.

## Acceptance Criteria

1. A JSON script with at least four scenes can be created and validated.
2. One command can generate narration WAV files for all scenes.
3. Scene duration is calculated from measured audio length.
4. Subtitles appear in sync with narration.
5. Character expression changes per scene.
6. Scene visuals can be displayed.
7. A 1920 by 1080, 30fps MP4 can be produced.
8. Unchanged narration is reused on repeated execution.
9. Invalid inputs and missing assets produce understandable errors.
10. A roughly three-minute video can be generated from start to finish.

## User Story Assessment

User Stories should execute. This is a new user-facing application with multiple workflows: first-time setup, script validation, voice generation, preview, rendering, cache behavior, and error recovery. User stories will clarify acceptance criteria for the creator persona and support the larger MVP scope.

## Extension Compliance Summary

- Security Baseline: N/A. User selected disabled, so full rules were not loaded or enforced.
- Resiliency Baseline: N/A. User selected disabled, so full rules were not loaded or enforced.
- Property-Based Testing: N/A. User selected disabled, so full rules were not loaded or enforced.


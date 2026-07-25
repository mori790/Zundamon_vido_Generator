# Units of Work

## Decomposition Decision

The MVP will be implemented as one application package with seven logical units. Work proceeds sequentially in dependency order from shared types through tests and documentation.

## Greenfield Code Organization Strategy

Application code will live in the workspace root, not under `aidlc-docs/`.

| Area | Directory |
|---|---|
| CLI entry points | `scripts/` |
| Shared core modules | `src/core/` |
| Remotion composition | `src/compositions/` |
| React scene components | `src/components/` |
| Runtime schemas | `src/schemas/` |
| Shared types | `src/types/` |
| Utilities | `src/utils/` |
| User scripts | `input/` |
| Static assets and generated audio | `public/` |
| Generated manifests and timelines | `generated/` |
| Rendered MP4 output | `output/` |
| Tests | `tests/` or colocated `*.test.ts` files, chosen during Code Generation based on tool defaults |

## Unit U1: Project Foundation and Shared Types

### Purpose

Create the TypeScript, Node.js, React, and Remotion foundation for the MVP and define shared domain types.

### Responsibilities

- Create `package.json`, `tsconfig.json`, Remotion configuration, and project folders.
- Define `VideoScript`, scene, visual, speaker, manifest, timeline, and render prop types.
- Establish shared constants and environment defaults.
- Provide base file and frame utilities used by later units.

### Primary Outputs

- Project configuration.
- `src/types/video.ts`.
- Initial `src/utils/` modules.

## Unit U2: Script Validation, Assets, and Path Safety

### Purpose

Implement safe script loading, Zod validation, warnings, and asset checks.

### Responsibilities

- Implement `src/schemas/video-script.ts`.
- Implement script loading and video ID validation.
- Validate required fields, duplicate scene IDs, unsupported values, invalid numbers, and negative durations.
- Resolve public references safely and prevent directory traversal.
- Check visuals, backgrounds, BGM, and character assets.
- Support development placeholder assets.

### Primary Outputs

- Script loader.
- Asset checker.
- Path resolver.
- Validation command support.

## Unit U3: VOICEVOX Audio Generation and Cache

### Purpose

Generate narration WAV files using VOICEVOX Engine and cache unchanged results.

### Responsibilities

- Implement VOICEVOX connection checks and API client.
- Generate audio query and synthesis requests.
- Apply speaker voice settings.
- Write WAV files to `public/audio/{videoId}/{sceneId}.wav`.
- Compute cache hash.
- Read and write manifest cache metadata.
- Implement `--force` behavior.

### Primary Outputs

- VOICEVOX client.
- Voice generator.
- Manifest store.
- Voice command support.

## Unit U4: Audio Measurement and Timeline Generation

### Purpose

Measure WAV duration and generate frame-accurate timeline data.

### Responsibilities

- Measure WAV durations.
- Convert seconds to frames using configured fps.
- Apply before and after speech waits.
- Generate sequential scene frame data.
- Save timeline JSON to `generated/timelines/{videoId}.timeline.json`.

### Primary Outputs

- Audio analyzer.
- Timeline generator.
- Timeline store.
- Timeline command support.

## Unit U5: Remotion Composition and Scene Rendering

### Purpose

Render scenes, subtitles, character art, visuals, audio, BGM, title, and ending in Remotion.

### Responsibilities

- Register Remotion composition in `src/Root.tsx`.
- Implement `ZundamonVideo` composition.
- Implement scene, character, subtitle, visual, title, and ending components.
- Implement simple lip sync and slight character motion.
- Implement image, code, and text visuals.
- Render optional BGM and scene audio.

### Primary Outputs

- Remotion composition.
- React scene components.
- Subtitle text helpers.

## Unit U6: CLI Orchestration and Render Integration

### Purpose

Connect validation, voice, timeline, preview, and rendering into user-facing commands.

### Responsibilities

- Implement `scripts/validate-script.ts`.
- Implement `scripts/generate-voices.ts`.
- Implement `scripts/generate-timeline.ts`.
- Implement `scripts/generate-video.ts`.
- Implement preview and render orchestration using Remotion Node APIs where applicable.
- Emit consistent INFO, WARN, and ERROR logs.
- Map domain failures to specified Japanese messages.

### Primary Outputs

- CLI scripts.
- Render service.
- End-to-end `npm run video -- {videoId}` flow.

## Unit U7: Tests, Sample Data, Placeholder Assets, and Documentation

### Purpose

Make the MVP verifiable and usable by the creator before real assets are added.

### Responsibilities

- Add sample script JSON.
- Add development placeholder character, background, and visual assets.
- Add unit tests for validation, subtitle splitting, frame conversion, timeline, cache hash, file checks, and character image selection.
- Add lightweight integration tests for VOICEVOX connection behavior and timeline flow.
- Document setup, commands, directory structure, and manual render verification.

### Primary Outputs

- Tests.
- Placeholder assets.
- Sample input.
- README.

## Construction Stage Application

Functional Design, NFR Requirements, NFR Design, and Code Generation will be applied to the full unit set as one grouped MVP pass. This keeps approval overhead controlled while preserving traceability across all seven units.


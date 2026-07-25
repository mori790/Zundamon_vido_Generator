# Services

## Service Overview

| Service | Responsibility | Calls |
|---|---|---|
| Validation Service | Validate script and assets before generation. | Script Loader, Asset Checker, Logger |
| Voice Service | Generate or reuse narration WAV files. | VOICEVOX Client, Manifest Store, Audio Analyzer, Logger |
| Timeline Service | Generate frame timeline from script and manifest durations. | Script Loader, Manifest Store, Timeline Generator |
| Render Service | Build props and render MP4 through Remotion Node APIs. | Render Data Builder, Timeline Store, Remotion APIs |
| Video Pipeline Service | Execute full `npm run video -- {videoId}` workflow. | Validation, Voice, Timeline, Render |
| Preview Service | Prepare data for Remotion Studio preview. | Validation, Render Data Builder, Remotion Studio command/API |

## Orchestration Patterns

### Validate Command

1. Parse `videoId`.
2. Load script through Zod validation.
3. Check asset references and placeholders.
4. Print warnings and stop on blocking errors.

### Voice Command

1. Parse `videoId` and `--force`.
2. Load and validate script.
3. Check VOICEVOX connection.
4. Load manifest.
5. For each scene, compare cache hash.
6. Generate WAV only when needed.
7. Measure duration and update manifest.

### Timeline Command

1. Load validated script.
2. Load manifest with audio duration data.
3. Generate frame timeline.
4. Save timeline JSON.

### Video Command

1. Run validation.
2. Run voice generation.
3. Run timeline generation.
4. Build render input props.
5. Render MP4 with Remotion Node APIs.
6. Confirm output path and log completion.

### Preview Command

1. Validate script and available assets.
2. Generate or load timeline if available.
3. Start Remotion Studio with selected video input props.

## Error Handling Boundaries

- Services return typed results or throw domain errors.
- CLI scripts catch domain errors and print Japanese user-facing messages.
- Low-level HTTP, file system, and Remotion errors are wrapped with context such as video ID, scene ID, and target path.

## Data Ownership

- `input/` is user-authored.
- `public/audio/` contains generated audio used by Remotion.
- `generated/manifests/` contains cache metadata.
- `generated/timelines/` contains computed frame data.
- `output/` contains rendered MP4 files.


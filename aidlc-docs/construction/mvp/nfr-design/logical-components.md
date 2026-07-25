# Logical Components

## Component Overview

| Logical Component | NFR Role |
|---|---|
| Domain Error Factory | Creates stable, contextual errors for CLI reporting. |
| Logger | Provides default and verbose logging modes. |
| Path Resolver | Enforces safe public asset boundaries. |
| Manifest Store | Persists cache state with direct JSON writes. |
| Timeline Store | Persists deterministic timeline JSON. |
| VOICEVOX Client | Contains HTTP calls and fail-fast failure mapping. |
| Render Service | Wraps Remotion Node APIs and render failure handling. |
| Test Harness | Separates unit, live integration, and optional render verification commands. |

## Domain Error Factory

### Responsibilities

- Create errors with stable codes.
- Carry optional `videoId`, `sceneId`, `targetPath`, and `cause`.
- Provide Japanese messages for specified user-facing failures.

### Required Error Codes

- `SCRIPT_NOT_FOUND`
- `SCRIPT_VALIDATION_FAILED`
- `ASSET_NOT_FOUND`
- `VOICEVOX_CONNECTION_FAILED`
- `VOICEVOX_SYNTHESIS_FAILED`
- `AUDIO_DURATION_FAILED`
- `TIMELINE_GENERATION_FAILED`
- `RENDER_FAILED`

## Logger

### Responsibilities

- Emit INFO, WARN, and ERROR messages.
- Accept `--verbose` from CLI command parsing.
- Print cache hits, generated files, warnings, and final output.
- Include lower-level details only when verbose mode is enabled.

## Path Resolver

### Responsibilities

- Resolve workspace paths from known root directories.
- Validate CLI `videoId` before using it in file paths.
- Convert public references to safe file system paths.
- Reject traversal and paths outside `public`.

### Safety Contract

Only Path Resolver may translate JSON asset references into file system paths.

## Manifest Store

### Responsibilities

- Load existing manifest or provide an empty structure.
- Save manifest with direct JSON writes.
- Preserve successful scene entries across later failures.
- Expose scene entry lookup by scene ID.

## Timeline Store

### Responsibilities

- Save timeline JSON directly to `generated/timelines`.
- Load timeline for rendering or preview.
- Keep timeline data independent from Remotion runtime hooks.

## VOICEVOX Client

### Responsibilities

- Check engine availability.
- Call `audio_query`.
- Call `synthesis`.
- Fail fast without retry.
- Attach base URL and scene context to failures.

## Render Service

### Responsibilities

- Build typed input props.
- Call Remotion Node APIs.
- Write MP4 to `output/{videoId}.mp4`.
- Convert render failures into `RENDER_FAILED` domain errors.

## Test Harness

### Responsibilities

- Run unit tests through the default test command.
- Run live integration tests through an explicit integration command.
- Run optional render verification through `npm run test:render`.
- Document manual render verification in build-and-test artifacts and README.

## NFR Traceability

| NFR Requirement | Logical Components |
|---|---|
| Render performance target | Render Service, Test Harness |
| Voice cache reuse | Manifest Store, VOICEVOX Client |
| Partial progress | Manifest Store, Logger |
| Path safety | Path Resolver, Domain Error Factory |
| Clear VOICEVOX failures | VOICEVOX Client, Domain Error Factory, Logger |
| Clear render failures | Render Service, Domain Error Factory, Logger |
| Maintainable boundaries | Path Resolver, Manifest Store, Timeline Store, Render Service |
| Test separation | Test Harness |


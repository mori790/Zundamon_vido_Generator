# Component Dependencies

## Dependency Direction

Dependencies must flow in one direction:

1. CLI scripts call services and core modules.
2. Core modules use domain types, schemas, utilities, and external APIs.
3. Remotion components consume render data and shared types.
4. Core modules do not import Remotion components.
5. Remotion components do not perform network or file system mutation.

## Dependency Matrix

| Component | Depends On | Must Not Depend On |
|---|---|---|
| CLI Orchestrator | Services, Logger | React component internals |
| Validation Service | Script Loader, Asset Checker | VOICEVOX, Remotion render |
| Voice Service | Script Loader, VOICEVOX Client, Manifest Store, Audio Analyzer | Remotion components |
| Timeline Service | Script Loader, Manifest Store, Timeline Generator | VOICEVOX Client, Remotion components |
| Render Service | Render Data Builder, Remotion Node APIs | VOICEVOX synthesis flow |
| Script Loader | Zod schema, Path Resolver | VOICEVOX, Remotion |
| Asset Checker | Path Resolver, File utilities | VOICEVOX |
| VOICEVOX Client | Fetch/HTTP API | File layout decisions |
| Manifest Store | File utilities, Types | Remotion components |
| Timeline Generator | Types, Frame utilities | File system, VOICEVOX |
| Render Data Builder | Script Loader, Manifest Store, Timeline Store | VOICEVOX synthesis |
| Remotion Components | Render data, Types, UI utilities | File system mutation, VOICEVOX |

## Communication Patterns

- CLI to core: direct TypeScript function calls.
- Core to VOICEVOX: HTTP requests through one client module.
- Core to generated files: JSON and WAV file reads/writes through utility-backed stores.
- Core to Remotion render: typed input props passed through Remotion Node APIs.
- Remotion to media: public paths referenced through Remotion static asset mechanisms.

## Data Flow

| Step | Input | Output |
|---|---|---|
| Script Load | `input/{videoId}.json` | `VideoScript` |
| Asset Check | `VideoScript` | `AssetCheckResult` |
| Voice Generation | `VideoScript`, previous manifest | WAV files and `VoiceManifest` |
| Audio Measurement | WAV files | duration seconds in manifest |
| Timeline Generation | `VideoScript`, `VoiceManifest` | `Timeline` |
| Render Data Build | `VideoScript`, `VoiceManifest`, `Timeline` | `ZundamonCompositionProps` |
| Remotion Render | `ZundamonCompositionProps`, public assets | `output/{videoId}.mp4` |

## Coupling Rules

- Shared domain types may be imported by both CLI/core and Remotion.
- Zod parsing stays at input boundaries and should not be repeated inside React components.
- Cache hashing must not depend on file system timestamps.
- Timeline generation must not depend on Remotion frame hooks.
- Rendering must not mutate script, manifest, or timeline files.


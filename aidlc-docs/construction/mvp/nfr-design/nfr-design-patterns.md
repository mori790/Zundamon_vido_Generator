# NFR Design Patterns

## Scope

These patterns apply to the full MVP implementation. The application is a local CLI and Remotion project with no cloud infrastructure.

## Error Boundary Pattern

Use typed domain errors at module boundaries.

| Error Area | Pattern |
|---|---|
| Validation | Return or throw errors with field, scene ID, and target path context. |
| Asset checks | Report blocking missing visual/background/character assets and warning-only missing BGM. |
| VOICEVOX | Fail fast without retry and include scene ID, text, and base URL context. |
| Rendering | Wrap Remotion or FFmpeg failures with a Japanese rendering failure message and original cause. |
| CLI | Catch domain errors and print stable user-facing messages. |

## Logging Pattern

Default logs are normal verbosity. They include major steps, cache hits, warnings, and final output.

| Mode | Behavior |
|---|---|
| Default | INFO, WARN, ERROR for creator-facing progress and failures. |
| Verbose | Enabled with `--verbose`; includes lower-level file paths, HTTP step names, and render orchestration details. |

Verbose logging must not expose secrets. The MVP has no API keys, but logging code should avoid dumping arbitrary environment variables.

## Path Boundary Pattern

User-controlled JSON paths are treated as public references, not arbitrary file system paths.

1. Accept public-style paths such as `/visuals/video-id/image.png`.
2. Normalize the path.
3. Reject absolute file system paths, parent-directory traversal, and paths resolving outside `public`.
4. Convert safe public references to workspace file paths only inside the path resolver.
5. Keep Remotion-facing media paths public-relative.

## Cache Consistency Pattern

Voice cache uses deterministic hashing and direct JSON writes.

| Decision | Design |
|---|---|
| Hash input | Scene text plus video-level speaker settings. |
| Cache hit | Matching hash and existing WAV file. |
| Cache miss | Generate WAV and update manifest. |
| Force mode | Regenerate all scene WAV files. |
| Manifest write | Directly write JSON to target manifest file after each successful scene. |
| Failure behavior | Keep existing successful WAV files and manifest entries. |

## VOICEVOX Failure Pattern

VOICEVOX HTTP failures are not retried in MVP.

- Connection check failure stops before scene generation.
- `audio_query` failure stops with scene context.
- `synthesis` failure stops with scene context.
- Partial progress before the failing scene is preserved.

## Timeline Determinism Pattern

Timeline generation is pure with respect to script and manifest data.

- Same script, manifest, and fps produce the same timeline.
- Frame conversion uses one shared helper.
- Timeline generation does not depend on Remotion frame hooks.
- Timeline JSON is directly written to the target file.

## Render Verification Pattern

Default test commands do not run heavy Remotion rendering. Add an optional script such as `npm run test:render` to render a sample video when local VOICEVOX audio and render dependencies are available.

Manual verification remains documented for creators who want to confirm MP4 output outside automated tests.

## Test Separation Pattern

| Test Type | Command Pattern | Blocking |
|---|---|---|
| Unit tests | `npm test` | Yes |
| Live VOICEVOX integration | `npm run test:integration` | Yes when invoked; fails if VOICEVOX is unavailable |
| Render verification | `npm run test:render` | Optional and not part of default `npm test` |

## Performance Pattern

- Prefer in-memory transformations for validation, timeline, subtitles, and render data building.
- Avoid regenerating unchanged audio.
- Keep voice generation sequential for MVP.
- Avoid expensive Remotion rendering until validation, voice generation, and timeline generation have succeeded.

## Extension Compliance Summary

- Security Baseline: N/A. Disabled during Requirements Analysis.
- Resiliency Baseline: N/A. Disabled during Requirements Analysis.
- Property-Based Testing: N/A. Disabled during Requirements Analysis.


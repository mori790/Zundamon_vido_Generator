# Business Rules

## Script Rules

| Rule | Type | Behavior |
|---|---|---|
| Script file must exist at `input/{videoId}.json` | Blocking | Stop with missing script message. |
| Script `id` must match CLI `videoId` | Blocking | Stop with validation error. |
| `title` must be present | Blocking | Stop with validation error. |
| `scenes` must contain at least one scene | Blocking | Stop with validation error. |
| Scene IDs must be unique | Blocking | Stop and identify duplicates. |
| Scene `text` must be non-empty | Blocking | Stop with scene ID context. |
| Unsupported scene type, emotion, or visual type is invalid | Blocking | Stop with validation error. |
| `width`, `height`, and `fps` must be positive | Blocking | Stop with validation error. |
| Wait durations must not be negative | Blocking | Stop with validation error. |

## Asset Rules

| Rule | Type | Behavior |
|---|---|---|
| JSON asset references must resolve under `public` | Blocking | Reject path traversal and external paths. |
| Configured scene image visual must exist | Blocking | Stop with scene ID and target path. |
| Configured background image must exist | Blocking | Stop with target path. |
| Configured BGM that is missing | Warning | Continue without BGM. |
| Missing title scene | Warning | Continue. |
| Missing ending scene | Warning | Continue. |
| Sample videos may use bundled placeholder character assets | Allowed | Continue with placeholder assets. |
| User-created videos missing real character assets | Blocking | Stop with missing character asset details. |

## Speaker and VOICEVOX Rules

| Rule | Type | Behavior |
|---|---|---|
| Speaker settings apply at video level only | MVP constraint | Scene-level overrides are ignored or rejected if present. |
| `speakerId` must be numeric | Blocking | Stop with validation error. |
| VOICEVOX Engine must be reachable for voice generation | Blocking | Stop with specified Japanese connection message. |
| Audio query settings are overridden by configured speed, pitch, intonation, and volume | Required | Apply before synthesis. |
| Successful partial WAV files are retained after later failures | Required | Do not delete generated audio. |

## Cache Rules

| Rule | Type | Behavior |
|---|---|---|
| Cache hash uses text and video-level speaker settings | Required | SHA-256 deterministic hash. |
| Matching hash and existing WAV means cache hit | Required | Reuse WAV and duration metadata. |
| Changed hash means cache miss | Required | Regenerate WAV. |
| `--force` bypasses cache | Required | Regenerate all scene WAV files. |
| Manifest is saved after each successful scene | Required | Preserve partial progress. |

## Timeline Rules

| Rule | Type | Behavior |
|---|---|---|
| Default before speech duration is 0.2 seconds | Required | Used when omitted. |
| Default after speech duration is 0.3 seconds | Required | Used when omitted. |
| Frame conversion uses rounded `seconds * fps` | Required | Same helper used in code and tests. |
| Scene start frame is cumulative | Required | No overlap unless explicitly designed later. |
| Subtitle visible range equals audio range | Required | From audio start to audio end. |

## Subtitle Rules

| Rule | Type | Behavior |
|---|---|---|
| Subtitle is hidden when disabled | Required | Render `null`. |
| Initial max characters per line is 24 | Default | Configurable. |
| Initial max lines is 2 | Default | Configurable. |
| Line break priority is punctuation, particles, target length, forced split | Required | Applied in order. |
| Long subtitles shrink font first | Required | Preserve readability. |
| Maximum fallback lines is 3 | Required | Warn if still long. |
| MVP does not split subtitles into timed chunks | Constraint | Whole scene text appears during audio. |

## Character Rules

| Rule | Type | Behavior |
|---|---|---|
| Default character position is lower-right | Required | Right 40px, bottom 100px, width 420px. |
| Missing emotion defaults to `normal` | Required | Use normal image set. |
| During speech, mouth alternates by interval | Required | Default interval 5 frames. |
| Before and after speech, mouth is closed | Required | Closed image selected. |
| During speech, slight vertical motion is applied | Required | 2 to 4px movement. |

## Error and Log Rules

- INFO logs announce major successful steps.
- WARN logs announce recoverable issues.
- ERROR logs announce blocking failures with video ID, scene ID, or target path when available.
- CLI catches domain errors and prints user-facing Japanese messages.


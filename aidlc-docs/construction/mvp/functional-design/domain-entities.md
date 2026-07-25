# Domain Entities

## VideoScript

Represents one video script loaded from `input/{videoId}.json`.

| Field | Notes |
|---|---|
| `id` | Must match CLI video ID. |
| `title` | Required video title. |
| `description` | Optional description; missing value warns. |
| `speaker` | Required video-level speaker config. |
| `video` | Video dimensions, fps, background, and BGM settings. |
| `subtitle` | Subtitle display and layout settings. |
| `scenes` | Ordered scene list. |

## SpeakerConfig

Represents video-level voice settings.

| Field | Notes |
|---|---|
| `engine` | Must be `voicevox`. |
| `speakerId` | Numeric VOICEVOX speaker ID. |
| `speedScale` | Defaults to 1.0. |
| `pitchScale` | Defaults to 0. |
| `intonationScale` | Defaults to 1.0. |
| `volumeScale` | Defaults to 1.0. |

Scene-level speaker overrides are out of scope for MVP.

## Scene

Represents one timed scene.

| Field | Notes |
|---|---|
| `id` | Unique scene identifier. |
| `type` | `title`, `explanation`, `code`, `summary`, or `ending`. |
| `text` | Narration and subtitle text. |
| `emotion` | Optional; defaults to `normal`. |
| `visual` | Optional scene visual. |
| `durationBeforeSpeech` | Optional; defaults to 0.2 seconds. |
| `durationAfterSpeech` | Optional; defaults to 0.3 seconds. |
| `characterVisible` | Optional; defaults to true. |

## VisualConfig

Represents scene visual content.

| Type | Fields | Notes |
|---|---|---|
| `image` | `src`, `position`, `fit` | `src` must resolve under `public`. |
| `code` | `language`, `code`, `fileName` | Rendered with line numbers. |
| `text` | `heading`, `body` | Rendered as simple explanation content. |
| `none` | none | No visual content. |

## VoiceManifest

Represents generated audio cache metadata.

| Field | Notes |
|---|---|
| `videoId` | Video identifier. |
| `scenes` | Scene ID keyed manifest entries. |

Each manifest entry includes:

- `hash`
- `audioPath`
- `durationSeconds`

## Timeline

Represents frame-based render timing.

| Field | Notes |
|---|---|
| `videoId` | Video identifier. |
| `fps` | Frames per second. |
| `totalFrames` | Total composition duration. |
| `scenes` | Ordered timeline scene entries. |

Each timeline scene entry includes:

- `id`
- `startFrame`
- `audioStartFrame`
- `durationInFrames`
- `audioDurationInFrames`
- `audioPath`

## Render Data

Represents Remotion input props built from script, manifest, and timeline.

| Field | Notes |
|---|---|
| `script` | Validated `VideoScript`. |
| `timeline` | Generated timeline. |
| `manifest` | Voice metadata. |
| `assets` | Resolved public asset references when needed. |

## Validation Result

Represents validation output.

| Field | Notes |
|---|---|
| `errors` | Blocking errors that stop processing. |
| `warnings` | Non-blocking warnings. |

## Domain Error

Represents an application-level failure with context.

| Field | Notes |
|---|---|
| `code` | Stable error code. |
| `message` | User-facing Japanese message. |
| `videoId` | Optional context. |
| `sceneId` | Optional context. |
| `targetPath` | Optional context. |
| `cause` | Optional underlying error. |


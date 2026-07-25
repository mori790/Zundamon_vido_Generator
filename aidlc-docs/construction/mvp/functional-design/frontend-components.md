# Frontend Components

## Scope

The MVP frontend is a Remotion React render surface, not an interactive browser GUI. Components render video frames from prepared props and must not perform file system mutation or VOICEVOX calls.

## Component Hierarchy

| Component | Children | Responsibility |
|---|---|---|
| `Root` | `Composition` | Register Remotion composition and dimensions. |
| `ZundamonVideo` | `Scene`, audio/BGM layers | Select active scene sequences from timeline. |
| `Scene` | `TitleScene`, `EndingScene`, `Visual`, `Character`, `Subtitle` | Render scene layout by type. |
| `TitleScene` | `Character`, title text | Render title layout. |
| `EndingScene` | `Character`, ending text, credits | Render ending layout. |
| `Visual` | Image, code, or text subview | Render configured explanation content. |
| `Character` | image layer | Select expression and mouth state. |
| `Subtitle` | text spans | Render split lines and keyword highlights. |

## Props and State

Components receive all data as props. Frame-dependent visual state is derived from Remotion frame hooks and timeline values.

| Component | Key Props | Derived State |
|---|---|---|
| `ZundamonVideo` | script, timeline, manifest | current frame and scene sequences |
| `Scene` | scene, timelineScene, fps | local scene frame |
| `Character` | emotion, audio frame range, visible | mouth open/closed, vertical offset |
| `Subtitle` | text, config, visible range | split lines, font scale, highlights |
| `Visual` | visual config | chosen visual renderer |
| `TitleScene` | title, text, character config | title layout |
| `EndingScene` | text, credits, character config | ending layout |

## Interaction Flow

There are no viewer interactions in MVP rendering. The creator interacts through CLI commands and Remotion Studio preview.

## Rendering Rules

### Scene

- Title and ending scene types use specialized layouts.
- Explanation, summary, and code scenes use the standard explanation layout.
- Character rendering respects `characterVisible`.

### Character

- Emotion defaults to `normal`.
- Mouth is closed outside the audio playback range.
- Mouth alternates open/closed during audio playback based on `lipSyncIntervalFrames`.
- Slight vertical motion is active only during audio playback.

### Subtitle

- Subtitle renders only when enabled and within audio playback frames.
- Lines are generated before rendering from the subtitle split helper.
- If text is long, font size shrinks before increasing to 3 lines.
- Keyword highlighting applies to configured exact keyword matches.

### Visual

- Image visuals use `contain` by default.
- Code visuals show file name when provided, line numbers, and syntax highlighting when supported.
- Text visuals show heading and body.
- `none` or missing visual renders no visual panel.

### BGM and Audio

- Scene audio plays according to each scene's `audioStartFrame`.
- Optional BGM plays when configured and available.
- Missing BGM is a validation warning and should not block rendering.

## Validation Coverage

- US-005 subtitles are covered by `Subtitle`.
- US-006 and US-008 character rendering are covered by `Character`.
- US-009, US-013, US-015 visual and subtitle enhancement stories are covered by `Visual` and `Subtitle`.
- US-010 title and ending scenes are covered by specialized scene components.
- US-012 lip sync is covered by frame-derived character state.
- US-014 BGM is covered by composition-level audio layers.


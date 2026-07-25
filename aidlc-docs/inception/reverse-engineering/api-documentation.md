# API Documentation

## External APIs

### VOICEVOX Audio Query

- **Method**: `POST`
- **Path**: `/audio_query`
- **Purpose**: Create an audio query object from text and speaker ID.
- **Caller**: `src/core/voicevox-client.ts`.

### VOICEVOX Synthesis

- **Method**: `POST`
- **Path**: `/synthesis`
- **Purpose**: Generate WAV audio from an audio query.
- **Caller**: `src/core/voicevox-client.ts`.

## Internal APIs

### `loadVideoScript(videoId)`

- **Purpose**: Load and validate `input/{videoId}.json`.
- **Returns**: Parsed `VideoScript`.

### `generateVoices(videoId, options)`

- **Purpose**: Generate or reuse scene-level WAV audio.
- **Returns**: Generated and cached scene IDs plus manifest.

### `generateTimeline(script, manifest)`

- **Purpose**: Calculate frame timing from audio durations and scene padding.
- **Returns**: `Timeline`.

### `renderVideo(videoId, options)`

- **Purpose**: Build render data and render MP4 output.
- **Returns**: Render result with output path.

## Data Models

### `VideoScript`

- **Purpose**: User-authored video definition.
- **Important Fields**: `id`, `title`, `speaker`, `video`, `subtitle`, `scenes`.

### `Scene`

- **Purpose**: Single spoken video segment.
- **Important Fields**: `id`, `type`, `text`, `emotion`, `visual`, `durationBeforeSpeech`, `durationAfterSpeech`.

### `Timeline`

- **Purpose**: Frame-level scene timing.
- **Important Fields**: `videoId`, `fps`, `totalFrames`, `scenes`.


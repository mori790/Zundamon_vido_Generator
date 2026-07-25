# Integration Test Instructions

## Purpose

Validate interactions between the local CLI, VOICEVOX Engine, generated files, timeline data, and Remotion render flow.

## Test Scenarios

### Scenario 1: Script Validation and Asset Check

- **Description**: Validate the sample script and placeholder assets.
- **Setup**: Run `npm install`.
- **Command**:

```bash
npm run validate -- sample-video
```

- **Expected Results**:
  - Script loads successfully.
  - Four scenes are detected.
  - Title and ending scenes may warn for missing explanation visuals.
  - Validation completes successfully.

### Scenario 2: VOICEVOX Live Connection

- **Description**: Confirm the configured VOICEVOX Engine is reachable.
- **Setup**: Start VOICEVOX Engine at `VOICEVOX_BASE_URL`, default `http://localhost:50021`.
- **Command**:

```bash
npm run test:integration
```

- **Expected Results**:
  - Test passes when VOICEVOX Engine is running.
  - Test fails when VOICEVOX Engine is not running, by approved NFR design.

### Scenario 3: Voice, Timeline, and Render Pipeline

- **Description**: Generate WAV files, timeline JSON, and MP4 output from the sample script.
- **Setup**: Start VOICEVOX Engine.
- **Commands**:

```bash
npm run voice -- sample-video
npm run timeline -- sample-video
npm run video -- sample-video
```

- **Expected Results**:
  - WAV files are generated under `public/audio/sample-video/`.
  - Manifest is generated under `generated/manifests/`.
  - Timeline is generated under `generated/timelines/`.
  - MP4 is generated at `output/sample-video.mp4`.

## Cleanup

Generated files may be kept for cache verification. To manually reset generated outputs, remove only generated audio, manifest, timeline, and MP4 files after confirming they are not needed.

## Last Observed Result

- `npm run validate -- sample-video` passed.
- `npm run test:integration` failed because VOICEVOX Engine was unavailable or blocked in the execution environment, matching the selected behavior.


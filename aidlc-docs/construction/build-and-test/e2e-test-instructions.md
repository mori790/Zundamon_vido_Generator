# E2E Test Instructions

## Purpose

Validate the complete creator workflow from script JSON to MP4.

## Scenario: Sample Video End to End

### Setup

1. Install dependencies.
2. Start VOICEVOX Engine.
3. Confirm `input/sample-video.json` exists.

```bash
npm install
```

### Execution

```bash
npm run video -- sample-video
```

### Expected Results

- The sample script is validated.
- VOICEVOX connection is confirmed.
- WAV files are generated or reused.
- Timeline JSON is generated.
- Remotion renders `output/sample-video.mp4`.
- Logs include INFO messages for major steps and final output.

### Manual Video Checks

- MP4 opens and plays.
- Audio is present.
- Subtitles are visible during narration.
- Character art is visible.
- Scene expressions change.
- Explanation image/code/text visuals render where configured.
- Video does not cut off before the ending scene.

## Notes

This E2E check is manual for MVP because Remotion rendering is environment-heavy and not part of default `npm test`.


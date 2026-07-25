# Business Logic Model

## Scope

This functional design covers the complete MVP as one grouped construction unit. It defines business workflows and data transformations across the seven logical units.

## Primary Workflows

### Validation Workflow

1. Receive `videoId` from CLI.
2. Validate `videoId` contains only safe path characters.
3. Resolve `input/{videoId}.json`.
4. Parse JSON.
5. Validate script shape with Zod.
6. Confirm script `id` matches `videoId`.
7. Collect blocking validation errors.
8. Collect non-blocking warnings.
9. Resolve all configured public asset references.
10. Check required character assets using the sample-only placeholder policy.

### Voice Generation Workflow

1. Load and validate script.
2. Check VOICEVOX Engine connection.
3. Load existing manifest or create an empty one.
4. For each scene, build voice cache hash from scene text and video-level speaker settings.
5. If `--force` is false and manifest hash matches an existing WAV, reuse the WAV.
6. Otherwise call VOICEVOX `audio_query`.
7. Override query voice parameters from video-level speaker settings.
8. Call VOICEVOX `synthesis`.
9. Save WAV to `public/audio/{videoId}/{sceneId}.wav`.
10. Measure WAV duration.
11. Update manifest entry for the scene.
12. Save manifest after successful scene generation so partial progress is retained.

### Timeline Workflow

1. Load validated script.
2. Load manifest.
3. For each scene in script order, read audio duration from manifest.
4. Apply `durationBeforeSpeech`, defaulting to 0.2 seconds.
5. Apply `durationAfterSpeech`, defaulting to 0.3 seconds.
6. Convert all durations to frames using configured fps.
7. Set each scene `startFrame` from cumulative prior durations.
8. Set `audioStartFrame` to `startFrame + beforeSpeechFrames`.
9. Save timeline JSON.

### Render Workflow

1. Load script, manifest, and timeline.
2. Build typed Remotion props.
3. Register a composition using script video settings and timeline total frames.
4. For each timeline scene, render scene content at the correct frame range.
5. Render scene audio from generated WAV.
6. Render subtitles from audio start through audio end.
7. Render character art if visible.
8. Render scene visual, title, ending, code, text, optional BGM, and keyword highlights.
9. Use Remotion Node APIs to write `output/{videoId}.mp4`.

### Full Video Command Workflow

1. Run validation.
2. Run voice generation.
3. Run timeline generation.
4. Run render.
5. Log output path on success.
6. Stop at first blocking failure with a clear Japanese error.

## Key Decisions

- Scene-level speaker overrides are not supported in MVP.
- Placeholder character assets are allowed only for bundled sample videos.
- Missing scene visual images are blocking errors.
- Missing optional BGM is a warning.
- Long subtitles use shrink-to-fit and up to 3 lines, then warn.
- Live VOICEVOX integration tests fail when VOICEVOX Engine is not running.

## Story Coverage

| Workflow | Stories |
|---|---|
| Validation | US-001, US-009, US-010, US-014 |
| Voice generation and cache | US-002, US-003 |
| Timeline | US-004 |
| Rendering | US-005, US-006, US-008, US-009, US-010, US-012, US-013, US-014, US-015 |
| CLI and errors | US-007, US-011 |


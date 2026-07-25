# Components

## Design Decisions

- Use the specification's structure: `scripts/` for CLI entry points and `src/` for shared application code and Remotion components.
- Use Zod schemas as the runtime validation boundary and infer TypeScript types where practical.
- Use Remotion Node APIs from TypeScript scripts for controlled render orchestration.
- Pass script, manifest, and timeline JSON to Remotion using input props.
- Keep dependencies one-way: CLI orchestration depends on core modules; Remotion depends on render data and shared types; core modules do not depend on Remotion.

## Component List

| Component | Location | Purpose |
|---|---|---|
| Script Schema | `src/schemas/video-script.ts` | Define and validate script JSON shape with Zod. |
| Domain Types | `src/types/video.ts` | Export domain and render data types used by scripts and Remotion. |
| Script Loader | `src/core/script-loader.ts` | Read `input/{videoId}.json`, parse JSON, and return validated script data. |
| Asset Checker | `src/core/asset-checker.ts` | Validate referenced public assets and required character placeholders or real assets. |
| Path Resolver | `src/core/path-resolver.ts` | Normalize paths, constrain public references, and derive project file paths. |
| VOICEVOX Client | `src/core/voicevox-client.ts` | Wrap VOICEVOX Engine HTTP calls and connection checks. |
| Voice Generator | `src/core/voice-generator.ts` | Generate WAV files scene by scene using VOICEVOX Client and cache state. |
| Manifest Store | `src/core/manifest-store.ts` | Read and write generated voice cache metadata. |
| Audio Analyzer | `src/core/audio-analyzer.ts` | Measure WAV duration in seconds. |
| Timeline Generator | `src/core/timeline-generator.ts` | Convert scene durations into frame-based timeline data. |
| Render Data Builder | `src/core/render-data-builder.ts` | Combine script, manifest, and timeline into Remotion input props. |
| Logger | `src/core/logger.ts` | Emit INFO, WARN, and ERROR messages with consistent formatting. |
| CLI Orchestrator | `scripts/*.ts` | Implement user commands for validate, voice, timeline, preview, render, and video. |
| Remotion Root | `src/Root.tsx` | Register the video composition and default props. |
| Zundamon Composition | `src/compositions/ZundamonVideo.tsx` | Render all scenes using timeline data. |
| Scene Components | `src/components/*.tsx` | Render scene layout, character, subtitles, visuals, title, and ending. |
| Utilities | `src/utils/*.ts` | Provide frame, file, text, and subtitle helper functions. |

## Responsibilities

### Script Schema

- Define allowed scene types, emotions, speaker settings, video settings, subtitle settings, and visual variants.
- Apply defaults for optional settings where appropriate.
- Produce typed data for downstream components.

### Script Loader

- Resolve the input script path from a video ID.
- Read and parse JSON.
- Validate the script through Script Schema.
- Ensure script `id` matches the requested video ID.

### Asset Checker and Path Resolver

- Keep JSON-controlled file references inside `public`.
- Verify visuals, backgrounds, BGM, and character assets.
- Allow development placeholder assets for character art.
- Return blocking validation errors and non-blocking warnings.

### Voice Generation

- Check VOICEVOX connectivity.
- Generate audio query and synthesis requests per scene.
- Persist WAV files under `public/audio/{videoId}`.
- Reuse generated audio when the cache hash matches.
- Update manifest duration and hash metadata.

### Timeline Generation

- Read measured audio durations.
- Apply scene wait durations.
- Convert seconds to rounded frames.
- Write timeline JSON under `generated/timelines`.

### Rendering

- Build Remotion input props from script, manifest, and timeline data.
- Use Remotion Node APIs for render orchestration.
- Render title, explanation, code, summary, and ending scenes.
- Render subtitles, character art, visuals, BGM, and audio.

## Non-Responsibilities

- Core modules must not import Remotion components.
- Remotion components must not call VOICEVOX or mutate generated files.
- CLI scripts must orchestrate modules but avoid embedding business logic.
- MVP does not include GUI, YouTube upload, AI script generation, or web image search.


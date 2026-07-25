# Code Structure

## Build System

- **Type**: npm.
- **Runtime**: Node.js with TypeScript ESM.
- **Primary Commands**: `npm run validate`, `npm run voice`, `npm run timeline`, `npm run preview`, `npm run video`, `npm test`.

## Existing Files Inventory

- `scripts/validate-script.ts` - CLI validation entry point.
- `scripts/generate-voices.ts` - CLI voice generation entry point.
- `scripts/generate-timeline.ts` - CLI timeline generation entry point.
- `scripts/generate-video.ts` - full CLI generation and render entry point.
- `scripts/preview.ts` - Remotion Studio preview entry point.
- `src/core/script-loader.ts` - loads and validates video scripts.
- `src/core/asset-checker.ts` - verifies referenced assets and character files.
- `src/core/voicevox-client.ts` - performs VOICEVOX API calls.
- `src/core/voice-generator.ts` - generates WAV files and cache manifest entries.
- `src/core/audio-analyzer.ts` - measures WAV duration.
- `src/core/timeline-generator.ts` - converts audio durations into frames.
- `src/core/render-data-builder.ts` - joins script, manifest, and timeline for Remotion.
- `src/core/render-service.ts` - bundles and renders Remotion output.
- `src/schemas/video-script.ts` - Zod schema for script JSON.
- `src/types/video.ts` - shared TypeScript model definitions.
- `src/components/*.tsx` - visual presentation components.
- `src/compositions/ZundamonVideo.tsx` - main Remotion composition.
- `tests/*.test.ts` - unit and integration tests.

## Design Patterns

### Pipeline Steps

- **Location**: `scripts/*.ts` and `src/core/*`.
- **Purpose**: Keep validation, voice generation, timeline creation, and rendering independently runnable.

### File-Based Artifacts

- **Location**: `input/`, `public/`, `generated/`, `output/`.
- **Purpose**: Let creators inspect and rerun intermediate artifacts.

### Cache Manifest

- **Location**: `src/core/manifest-store.ts`, `src/core/voice-generator.ts`.
- **Purpose**: Reuse generated audio when scene text and speaker configuration have not changed.

## GUI-Relevant Modification Candidates

- Add a GUI package or app shell at workspace root.
- Extract CLI operations into callable service functions where needed.
- Add project/session metadata for GUI state without changing the existing script JSON contract prematurely.
- Add a Codex App Server integration boundary separate from Remotion rendering.


# System Architecture

## System Overview

The current system is a local TypeScript and Remotion CLI application. It has no GUI yet. The pipeline starts from `input/{videoId}.json`, validates the script and assets, generates VOICEVOX audio into `public/audio/`, creates cache manifests and timelines under `generated/`, then renders an MP4 into `output/`.

## Component Descriptions

### Input Script Layer

- **Purpose**: Store creator-authored video definitions.
- **Key Files**: `input/*.json`, `src/schemas/video-script.ts`, `src/types/video.ts`.
- **Dependencies**: Zod validation and path resolution.

### Generation Core

- **Purpose**: Run deterministic local generation steps.
- **Key Files**: `src/core/*`.
- **Dependencies**: VOICEVOX Engine, file system, WAV parsing, Remotion renderer.

### CLI Layer

- **Purpose**: Map npm scripts to generation actions.
- **Key Files**: `scripts/*.ts`.
- **Dependencies**: Core services and logger.

### Rendering Layer

- **Purpose**: Render React and Remotion compositions into MP4.
- **Key Files**: `src/Root.tsx`, `src/compositions/ZundamonVideo.tsx`, `src/components/*.tsx`.
- **Dependencies**: Remotion, React, generated render data, public assets.

## Data Flow

1. User creates or edits `input/{videoId}.json`.
2. Validation checks schema, duplicate scene IDs, supported visual types, and referenced assets.
3. Voice generation calls VOICEVOX and writes WAV files plus a manifest.
4. Timeline generation measures audio durations and calculates frame ranges.
5. Render data builder joins script, manifest, and timeline.
6. Remotion renders the composition into `output/{videoId}.mp4`.

## Integration Points

- **VOICEVOX Engine**: Local HTTP service at `http://localhost:50021` by default.
- **Remotion Renderer**: Local render engine for MP4 output.
- **File System**: Primary persistence layer for scripts, assets, audio, generated metadata, and rendered output.

## GUI Implication

A future GUI should sit above the current CLI/core layers. It should not duplicate the rendering pipeline. It should orchestrate project creation, script editing, Codex-assisted planning, JSON review, validation, voice generation, preview, render, and logs by calling or wrapping existing services.


# Build Instructions

## Prerequisites

- **Build Tool**: npm with TypeScript compiler
- **Runtime**: Any currently supported Node.js LTS version
- **Dependencies**: npm packages from `package.json`
- **System Requirements**: macOS, Remotion-compatible Chromium/FFmpeg environment
- **VOICEVOX**: Required for voice generation and live integration tests

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Optional environment variables:

```bash
export VOICEVOX_BASE_URL=http://localhost:50021
export DEFAULT_SPEAKER_ID=3
export OUTPUT_DIR=output
export AUDIO_DIR=public/audio
export DEFAULT_FPS=30
export DEFAULT_WIDTH=1920
export DEFAULT_HEIGHT=1080
```

### 3. Type Check

```bash
npx tsc --noEmit
```

### 4. Verify Build Success

- **Expected Output**: `npx tsc --noEmit` exits with code 0 and no TypeScript errors.
- **Build Artifacts**: No compiled artifact is emitted; runtime uses `tsx` and Remotion.
- **Runtime Artifacts**: WAV files under `public/audio/`, manifests under `generated/manifests/`, timelines under `generated/timelines/`, MP4 files under `output/`.

## Troubleshooting

### Dependency Errors

- Run `npm install`.
- Confirm Node.js is an active LTS version.
- If Remotion install scripts are blocked by npm script approval, review with `npm approve-scripts`.

### Compilation Errors

- Run `npx tsc --noEmit`.
- Fix the file and line reported by TypeScript.
- Rerun type check before running render commands.

### npm Audit Warnings

`npm install` reported 5 audit vulnerabilities during generation. Do not run `npm audit fix --force` without reviewing breaking changes.


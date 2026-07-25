# MVP Code Generation Plan

## Unit Context

Code Generation will implement the full MVP as one grouped pass across all seven logical units. Application code must be generated in the workspace root, never inside `aidlc-docs/`.

## Workspace and Code Location

- **Workspace Root**: `/Users/tomimorichiharu/Zundamon_vido_Generator`
- **Project Type**: Greenfield single application package
- **Application Code**: workspace root
- **Documentation Summaries**: `aidlc-docs/construction/mvp/code/`

## Stories Covered

- US-001 through US-015 from `aidlc-docs/inception/user-stories/stories.md`.

## Dependencies and Interfaces

- Use TypeScript, React, Remotion, Zod, npm, and `tsx`.
- Use one-way dependencies: CLI scripts call core modules; Remotion consumes render data and shared types; core modules do not import Remotion components.
- Use Zod as the runtime validation boundary.
- Use Remotion Node APIs for render orchestration.
- Use direct JSON writes for manifest and timeline files.
- Use fail-fast VOICEVOX handling without retries.

## Generation Steps

### Step 1: Project Structure Setup

- [x] Create `package.json` with npm scripts for `dev`, `validate`, `voice`, `timeline`, `preview`, `render`, `video`, `test`, `test:integration`, and `test:render`.
- [x] Create `tsconfig.json`, `remotion.config.ts`, `.gitignore`, and required directories.
- [x] Create `src/Root.tsx` registration shell.
- [x] Create code summary directory `aidlc-docs/construction/mvp/code/`.

**Stories**: Foundation for all stories.

### Step 2: Shared Types, Constants, and Utilities

- [x] Create `src/types/video.ts`.
- [x] Create `src/core/config.ts`.
- [x] Create `src/core/errors.ts`.
- [x] Create `src/core/logger.ts`.
- [x] Create `src/utils/frame.ts`, `src/utils/file.ts`, and `src/utils/text.ts`.

**Stories**: Supports US-001 through US-015.

### Step 3: Script Schema, Loading, Validation, and Asset Checks

- [x] Create `src/schemas/video-script.ts`.
- [x] Create `src/core/path-resolver.ts`.
- [x] Create `src/core/script-loader.ts`.
- [x] Create `src/core/asset-checker.ts`.
- [x] Create `scripts/validate-script.ts`.

**Stories**: US-001, US-006, US-009, US-010, US-014.

### Step 4: Voice Generation, Cache, Manifest, and Audio Duration

- [x] Create `src/core/voicevox-client.ts`.
- [x] Create `src/core/manifest-store.ts`.
- [x] Create `src/core/audio-analyzer.ts`.
- [x] Create `src/core/voice-generator.ts`.
- [x] Create `scripts/generate-voices.ts`.

**Stories**: US-002, US-003.

### Step 5: Timeline Generation

- [x] Create `src/core/timeline-generator.ts`.
- [x] Create `src/core/timeline-store.ts`.
- [x] Create `scripts/generate-timeline.ts`.

**Stories**: US-004.

### Step 6: Remotion Composition and Scene Components

- [x] Create `src/core/render-data-builder.ts`.
- [x] Create `src/compositions/ZundamonVideo.tsx`.
- [x] Create `src/components/Scene.tsx`.
- [x] Create `src/components/Character.tsx`.
- [x] Create `src/components/Subtitle.tsx`.
- [x] Create `src/components/Visual.tsx`.
- [x] Create `src/components/TitleScene.tsx`.
- [x] Create `src/components/EndingScene.tsx`.
- [x] Update `src/Root.tsx` with composition registration.

**Stories**: US-005, US-006, US-008, US-009, US-010, US-012, US-013, US-014, US-015.

### Step 7: CLI Orchestration and Render Integration

- [x] Create `src/core/render-service.ts`.
- [x] Create `scripts/generate-video.ts`.
- [x] Create `scripts/preview.ts`.
- [x] Ensure CLI supports `--force` and `--verbose` where relevant.
- [x] Ensure Japanese error messages match the specification where specified.

**Stories**: US-007, US-011.

### Step 8: Sample Data and Placeholder Assets

- [x] Create `input/samples/sample-video.json`.
- [x] Create `input/sample-video.json`.
- [x] Create sample visual files under `public/visuals/sample-video/`.
- [x] Create sample-only placeholder character assets under `public/characters/zundamon/`.
- [x] Create default background under `public/backgrounds/default.svg`.

**Stories**: US-001, US-006, US-009, US-010.

### Step 9: Unit Tests

- [x] Add Vitest configuration if needed.
- [x] Add tests for validation.
- [x] Add tests for subtitle splitting.
- [x] Add tests for seconds-to-frames conversion.
- [x] Add tests for timeline calculation.
- [x] Add tests for cache hash generation.
- [x] Add tests for path and asset checks.
- [x] Add tests for character image selection.

**Stories**: Supports verification for US-001, US-003, US-004, US-005, US-006, US-008, US-009.

### Step 10: Integration and Render Verification Commands

- [x] Add live VOICEVOX integration test behavior that fails when VOICEVOX Engine is unavailable.
- [x] Add optional `npm run test:render` command for sample render verification.
- [x] Keep Remotion render verification out of default `npm test`.

**Stories**: US-002, US-007, US-011.

### Step 11: Documentation and Code Summary

- [x] Update `README.md` with setup, directory structure, commands, VOICEVOX requirement, assets, and manual verification.
- [x] Create `aidlc-docs/construction/mvp/code/code-generation-summary.md`.
- [x] Mark implemented story coverage in this plan.

**Stories**: Supports all stories.

## Story Implementation Tracking

- [x] US-001 Validate a script before generation
- [x] US-002 Generate VOICEVOX narration for each scene
- [x] US-003 Reuse cached narration
- [x] US-004 Measure audio and generate scene timeline
- [x] US-005 Render synchronized subtitles
- [x] US-006 Render fixed character art
- [x] US-007 Render MP4 from one command
- [x] US-008 Switch character expressions by scene
- [x] US-009 Display explanation images
- [x] US-010 Show title and ending scenes
- [x] US-011 Report actionable errors and logs
- [x] US-012 Animate simple lip sync
- [x] US-013 Display code scenes
- [x] US-014 Play optional BGM
- [x] US-015 Highlight subtitle keywords

## Plan Approval

This plan is the single source of truth for Code Generation. Generation must execute these steps in order and update checkboxes immediately after each completed step.

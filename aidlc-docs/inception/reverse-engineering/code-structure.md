# Code Structure

## Build System

- **Package**: `zundamon-video-generator`, one private npm ESM package.
- **Language**: TypeScript/TSX targeting ES2022.
- **Studio build**: Vite 6 plus esbuild preload bundle.
- **Desktop runtime**: Electron 41.
- **Tests**: Vitest 4 and fast-check 4.

## Source Inventory

### Application and Composition

- `src/Root.tsx` - Remotion composition registration.
- `src/compositions/ZundamonVideo.tsx` - Main video composition.
- `src/components/` - Background, character, scene, subtitle, and visual rendering.
- `src/core/` - Script loading, validation, VOICEVOX, caching, timeline, render data, and rendering.
- `src/schemas/` - Zod script schema.
- `src/types/` - Script and timeline models.
- `src/utils/` - Filesystem, frame, logger, subtitle, WAV, and render-progress helpers.

### Electron Studio

- `src/studio/main/main.ts` - Window lifecycle and IPC registration.
- `src/studio/main/preload.ts` - Context-bridge API exposure.
- `src/studio/main/command-runner.ts` - Production child-process orchestration and logs.
- `src/studio/main/codex-app-server-service.ts` - Codex process, JSONL, sessions, turns, approvals, retries, diagnostics.
- `src/studio/main/local-file-service.ts` - Confined script/chat/asset filesystem operations.
- `src/studio/main/preview-data-service.ts` - Preview readiness and render-data loading.
- `src/studio/main/render-output-service.ts` - Output status, overwrite confirmation, verification, and reveal.
- `src/studio/renderer/StudioApp.tsx` - Workspace-level UI orchestration.
- `src/studio/renderer/CodexPanel.tsx` - Real/Mock chat, stream, approval, and recovery UI.
- `src/studio/renderer/ScriptReviewPanel.tsx` - Draft creation, validation, editing, asset attachment, and apply.
- `src/studio/renderer/PreviewPanel.tsx` - Embedded preview state and fallback.
- `src/studio/renderer/ProductionCommandPanel.tsx` - Command execution, logs, progress, stop, retry, and output actions.
- `src/studio/renderer/*-client.ts` - Purpose-specific preload clients.
- `src/studio/renderer/*-file-access.ts` - Renderer adapters over local-file API.
- `src/studio/renderer/real-codex-connection.ts` - Real App Server adapter.
- `src/studio/renderer/mock-codex-connection.ts` - Deterministic Mock adapter.
- `src/studio/shared/` - Assets, chat, Codex protocol, command, local-file, preview, proposals, render, draft/apply, and workspace contracts.

### CLI and Tests

- `scripts/validate-script.ts` - Script and asset validation.
- `scripts/generate-voices.ts` - VOICEVOX generation.
- `scripts/generate-timeline.ts` - Timeline generation.
- `scripts/preview.ts` - Remotion preview startup.
- `scripts/generate-video.ts` - Full generation/render flow.
- `tests/studio/` - Main, shared, Renderer, PBT, fake-process, and Electron E2E tests.
- `tests/fixtures/fake-codex-app-server.mjs` - Deterministic App Server test process.
- `tests/voicevox.integration.test.ts` - Live VOICEVOX integration.

## Design Patterns

- Purpose-specific IPC rather than generic filesystem or JSON-RPC exposure.
- Dependency injection at process/filesystem/time boundaries for deterministic tests.
- Pure state transition functions for proposals, turns, approvals, drafts, and progress.
- File-based persistence with bounded parsing and atomic Codex session writes.
- Existing CLI scripts reused by Electron Main rather than reimplemented in Renderer.

## Packaging-Relevant Gaps

- Main entry is TypeScript and currently launched through `NODE_OPTIONS='--import tsx'`.
- Studio build outputs Renderer/preload artifacts but no compiled Main bundle.
- Runtime paths use `process.cwd()` in several Main and CLI boundaries.
- No `build`, `productName`, application ID, icons, signing identities, entitlements, notarization, artifact naming, or release commands are configured.
- Runtime dependencies and development-only dependencies need packaging classification.

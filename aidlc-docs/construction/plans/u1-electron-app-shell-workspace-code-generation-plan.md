# Code Generation Plan: U1 Electron App Shell and Workspace Foundation

## Unit Context

- **Unit**: U1 Electron App Shell and Workspace Foundation.
- **Goal**: Add the first Electron/React Studio shell that can list existing `input/*.json` scripts, accept a new video ID, and open either an existing-script workspace or an empty-draft workspace.
- **Stories**: US-1 and US-20.
- **Dependencies**: Existing schema/types and workspace folder layout.
- **Out of Scope**: Codex chat, JSON draft editor, save/apply, command execution, logs, preview, render, asset copying.

## Target Code Locations

Application code will be created or modified under the workspace root only:

- `src/studio/shared/workspace.ts`
- `src/studio/renderer/workspace-client.ts`
- `src/studio/renderer/StudioApp.tsx`
- `src/studio/renderer/main.tsx`
- `src/studio/renderer/styles.css`
- `src/studio/main/main.ts`
- `src/studio/main/preload.ts`
- `studio.html`
- `vite.studio.config.ts`
- `vitest.config.ts`
- `tests/studio/workspace.test.ts`
- `tests/studio/StudioApp.test.tsx`
- `package.json`
- `tsconfig.json`

Documentation summary will be created under:

- `aidlc-docs/construction/u1-electron-app-shell-workspace/code/summary.md`

## Planned Dependencies

Add runtime dependencies:

- `@vitejs/plugin-react`
- `vite`
- `electron`

Add test dependencies:

- `@testing-library/react`
- `@testing-library/jest-dom`
- `jsdom`

## Step-by-Step Generation Plan

### Step 1: Project Configuration

- [x] Update `package.json` with Studio scripts:
  - `studio:dev`
  - `studio:build`
  - `studio:start`
- [x] Add required Electron/Vite/test dependencies.
- [x] Add `vite.studio.config.ts` for the React renderer app.
- [x] Add `vitest.config.ts` with jsdom environment for component tests.
- [x] Update `tsconfig.json` include list if needed.

### Step 2: Shared Workspace Types and Logic

- [x] Create `src/studio/shared/workspace.ts`.
- [x] Define `VideoProjectSummary`, `WorkspaceState`, `WorkspaceError`, and related state types.
- [x] Implement video ID normalization and validation.
- [x] Implement pure workspace state helpers for opening existing or empty draft states.

### Step 3: Renderer Workspace Client

- [x] Create `src/studio/renderer/workspace-client.ts`.
- [x] Implement `listVideoProjects()` helper.
- [x] Implement `loadWorkspace(videoId)` helper.
- [x] Keep file access behind narrow functions for future IPC migration.
- [x] Read from `input/*.json` only and avoid writes.

### Step 4: React Studio UI

- [x] Create `src/studio/renderer/StudioApp.tsx`.
- [x] Implement `StudioApp`, `StartScreen`, `ProjectList`, `NewProjectForm`, `WorkspaceOpenError`, `WorkspaceShell`, and `WorkspaceHeader`.
- [x] Include stable `data-testid` attributes.
- [x] Show existing JSON project list and new video ID form.
- [x] Open missing scripts as empty draft workspace.
- [x] Keep invalid existing scripts on the start screen with an error.

### Step 5: Renderer Entrypoint and Styling

- [x] Create `src/studio/renderer/main.tsx`.
- [x] Create `src/studio/renderer/styles.css`.
- [x] Create `studio.html`.
- [x] Keep design utilitarian and app-like, not a landing page.

### Step 6: Electron Main and Preload

- [x] Create `src/studio/main/main.ts`.
- [x] Create `src/studio/main/preload.ts`.
- [x] Open the Vite dev URL in development.
- [x] Load built `dist-studio/index.html` in packaged/start mode.
- [x] Keep preload minimal for U1.

### Step 7: Unit Tests

- [x] Create `tests/studio/workspace.test.ts`.
- [x] Test video ID validation.
- [x] Test existing-script workspace state.
- [x] Test empty-draft workspace state.
- [x] Test invalid-script error behavior.

### Step 8: Component Tests

- [x] Create `tests/studio/StudioApp.test.tsx`.
- [x] Test project list rendering.
- [x] Test new video ID submission.
- [x] Test workspace shell display.
- [x] Test error display for invalid existing script.

### Step 9: Code Summary

- [x] Create `aidlc-docs/construction/u1-electron-app-shell-workspace/code/summary.md`.
- [x] Summarize created and modified files.
- [x] Map implemented behavior to US-1 and US-20.

### Step 10: Verification

- [x] Run `npm install` to install new dependencies.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm test`.
- [x] Run `npm run studio:build`.
- [x] If feasible, run `npm run studio:dev` long enough to confirm startup command works.

## Story Traceability

- **US-1**: Covered by project list, new video ID input, existing-script workspace open, empty-draft workspace open.
- **US-20**: Partially covered by keeping the workspace shell usable without Codex. Full Codex-unavailable behavior belongs to U2.

## Approval Gate

This plan is the source of truth for U1 Code Generation. Code changes should not begin until this plan is approved.

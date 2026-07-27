# System Architecture

## System Overview

The repository is one local npm application with two user surfaces:

- Electron/React Studio for interactive creator workflows.
- TypeScript CLI scripts for validation, generation, preview, and rendering.

Electron uses a context-isolated security boundary. The Main process owns child processes and filesystem access. Preload exposes only purpose-specific APIs. The Renderer contains React UI and no direct Node or Electron access.

## Component Map

- **Electron Main**
  - Registers command, preview, render-output, local-file, and Codex IPC handlers.
  - Owns `CommandRunner`, `CodexAppServerService`, and local filesystem services.
- **Preload**
  - Exposes `commandApi`, `previewApi`, `renderOutputApi`, `localFileApi`, and `codexApi`.
- **React Renderer**
  - Owns workspace navigation, script review, Codex panel, preview, production commands, and status UI.
- **Shared Studio Contracts**
  - Defines validated messages, state transitions, limits, proposals, assets, drafts, and IPC types.
- **Generation Core**
  - Loads scripts, validates assets, calls VOICEVOX, manages cache manifests, calculates timelines, and renders.
- **Remotion Runtime**
  - Converts render data into video frames and MP4 output.

## Main Data Flows

### Creator Workflow

1. Renderer requests workspace metadata through preload.
2. Main reads `input/` and returns validated data.
3. Renderer edits a draft and Main writes approved script/backup files.
4. Renderer requests production commands.
5. Main runs existing npm/TypeScript scripts and streams operations/logs.
6. Preview reads generated render data; Render writes `output/{videoId}.mp4`.

### Codex Workflow

1. Renderer requests Real connection through `codexApi`.
2. Main starts `codex app-server` and performs initialize.
3. Main resumes or starts a thread and atomically persists its ID.
4. Renderer sends a bounded prompt; Main starts one active turn.
5. Main parses JSONL and emits assistant deltas, approvals, and terminal events.
6. Renderer batches display updates at 50 ms and persists completed assistant items.
7. Unknown, timed-out, disconnected, or shutdown approval requests are denied.

## Integration Points

- **Codex CLI 0.145.0+**: Local App Server over stdio; existing ChatGPT login.
- **VOICEVOX Engine 0.25.x**: Local HTTP audio query and synthesis.
- **Remotion 4.0.499**: Preview, bundling, composition selection, and rendering.
- **Filesystem**: Primary persistence for scripts, assets, sessions, generated data, and outputs.
- **Finder**: Native reveal of completed output.

## Infrastructure and Deployment

- No cloud infrastructure, database, REST server, container, CDK, Terraform, or CI workflow is present.
- Current runtime is local macOS development execution.
- No packaged application, signing, notarization, installer, updater, release feed, or distribution workflow exists.
- U10 therefore begins from an unpackaged Electron application.

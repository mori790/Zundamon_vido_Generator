# System Architecture

## System Overview

The repository is one local npm application with two user surfaces:

- Electron/React Studio for interactive creator workflows.
- TypeScript CLI scripts for validation, generation, preview, and rendering.

Electron uses a context-isolated security boundary. The Main process owns child processes and filesystem access. Preload exposes only purpose-specific APIs. The Renderer contains React UI and no direct Node or Electron access.

## Component Map

- **Electron Main**
  - Registers workspace, dependency, command, preview, render-output, local-file, and Codex IPC handlers.
  - Owns `WorkspaceRootService`, dependency diagnosis, `CommandRunner`, `CodexAppServerService`, and local filesystem services.
- **Preload**
  - Exposes purpose-specific Workspace, dependency, command, preview, render-output, local-file, and Codex APIs.
- **React Renderer**
  - Owns workspace navigation, text input, scene segmentation/editing, asset assignment, JSON generation, script review, Codex panel, preview, production commands, and status UI.
- **Shared Studio Contracts**
  - Defines validated messages, state transitions, limits, proposals, assets, drafts, and IPC types.
- **Generation Core**
  - Loads scripts, validates assets, calls VOICEVOX, manages cache manifests, calculates timelines, and renders.
- **Production Resource Boundary**
  - Resolves compiled Main/Preload/CLI, prebuilt Remotion bundle, ASAR-unpacked compositor binaries, and the user-selected Workspace.
- **Release Boundary**
  - Electron Forge creates arm64 `.app`/ZIP artifacts; verification creates SBOM, SHA-256, manifest, and release-state evidence.
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

### Text-to-Scene Workflow

1. Renderer accepts pasted text or a bounded local text file.
2. Shared validation rejects unsupported, empty, or oversized input.
3. Renderer sends a constrained segmentation prompt through the existing Codex boundary.
4. The response parser validates and normalizes ordered scenes.
5. Creator edits scene text, tags, and order, then assigns local image assets.
6. Script builder converts confirmed scenes into the existing validated `VideoScript` format.

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
- Runtime is a local macOS 13+ desktop application and compatible CLI.
- Electron Forge 7.11.2 generates an arm64 `.app` and ZIP.
- Signing, Hardened Runtime, and notarization are configured but require external Apple credentials.
- Current artifact state is `local-acceptance`; public release remains fail-closed.
- No installer, auto-updater, release feed, cloud deployment, or central monitoring exists.

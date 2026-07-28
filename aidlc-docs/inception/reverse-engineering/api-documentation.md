# API Documentation

## External APIs

### VOICEVOX

- `POST /audio_query` - creates an audio query.
- `POST /synthesis` - generates WAV audio.
- Base URL defaults to `http://localhost:50021`.

### Codex App Server

- Transport: newline-delimited JSON over child-process stdio.
- Stable methods used: `initialize`, `initialized`, `thread/start`, `thread/resume`, `turn/start`, and `turn/interrupt`.
- Notifications consumed: agent-message delta and turn completion.
- Server requests: recognized approval requests are surfaced to the user; unknown requests are denied.
- Limits: 64 KiB prompt, 1 MiB JSONL line, 128 pending requests, 5-minute approval timeout.

## Electron Renderer APIs

### `commandApi`

- `start(request)`, `stop(operationId)`, `clearLogs(operationId)`, `snapshot()`.
- `onOperation(listener)` and `onLog(listener)` return unsubscribe functions.

### `previewApi`

- `check(videoId)` and `load(videoId)`.

### `renderOutputApi`

- `status(videoId)`, `confirmOverwrite(videoId)`, and `reveal(videoId)`.

### `localFileApi`

- Workspace: list input, read script, write script.
- Draft text: read and write the per-video natural-language draft.
- Chat: read and write per-video history.
- Asset: select, tokenized copy, existence check, and trash.

### `codexApi`

- `connect(videoId)`, `send(input)`, `interrupt()`, `reconnect(videoId)`.
- `startNewThread(videoId)`, `respondApproval(id, approved)`, `disconnect()`.
- `onEvent(listener)` returns an unsubscribe function.

### `workspaceApi`

- `get()`, `select()`, and `clear()`.
- Returns `unconfigured`, `ready`, `missing`, `denied`, or `invalid` without exposing unrestricted filesystem operations.

### `dependencyApi`

- `checkAll()` and `check(name)`.
- Returns independent Codex/VOICEVOX status, detected version, and stable recovery action code.

## Core Internal APIs

- `loadVideoScript(videoId)` - loads and validates input JSON.
- `generateVoices(videoId, options)` - generates/reuses scene WAV files.
- `generateTimeline(script, manifest)` - calculates frame timing.
- `buildRenderData(videoId)` - joins validated script, audio manifest, and timeline.
- `renderVideo(videoId, options)` - renders MP4 with progress and stop support.
- `applyScriptDraft(videoId, rawJson, fileAccess)` - validates, backs up, and writes an approved script.
- `WorkspaceRootService` - selects, validates, persists, restores, or clears the project root.
- `validateTextInput(...)` - validates draft presence and bounded length.
- `buildSegmentationPrompt(draftText)` and `parseSegmentationResponse(responseText)` - create the constrained Codex request and validate its scene response.
- `buildVideoScript(scenes, videoId, title)` - converts confirmed scenes and assets into the existing `VideoScript` schema.
- `createDependencyDiagnosisService()` - performs bounded Codex and VOICEVOX checks.
- Release verifier - classifies `local-acceptance` through `publishable` from explicit evidence.

## Principal Data Models

- `VideoScript`, `Scene`, `SceneWithAsset`, `TextInputDraft`, `Timeline`, `WorkspaceState`.
- `ChatHistory`, `ChatMessage`, `Proposal`, `CodexApproval`, `CodexEvent`.
- `Operation`, `LogEntry`, `PreviewState`, `RenderOutputStatus`.
- `WorkspaceReference`, `ProjectRootState`, `DependencyReport`, `ReleaseManifest`, `ReleaseEvidence`.

No public REST API or database schema exists.

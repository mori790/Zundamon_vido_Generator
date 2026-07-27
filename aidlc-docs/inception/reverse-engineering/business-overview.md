# Business Overview

## Business Description

Zundamon Video Generator is a local creator desktop application and CLI pipeline. It helps an individual creator plan a video with Codex, review and approve JSON script drafts, attach visual assets, generate VOICEVOX speech and timelines, preview the composition, and render an MP4 with Remotion.

## Primary User

- Individual technical-video creator using macOS.

## Business Transactions

1. Open or create a video workspace identified by `videoId`.
2. Discuss a concept with Real Codex App Server or explicit Mock mode.
3. Review, approve, reject, or retry JSON-draft and command proposals.
4. Edit and validate a structured or raw video script.
5. Select, copy, replace, inspect, or trash scene image assets.
6. Generate or reuse VOICEVOX audio.
7. Generate a frame-accurate timeline.
8. Preview the Remotion composition.
9. Render, stop, retry, overwrite, and reveal an MP4 output.
10. Resume a Codex thread and recover manually after connection failure.

## Business Dictionary

- **Video ID**: Stable workspace identifier matching `input/{videoId}.json`.
- **Workspace**: Script, chat history, Codex session, generated media, and output associated with one video ID.
- **Proposal**: AI-produced JSON draft or production command requiring creator review.
- **App Server Approval**: Separate fail-closed permission request for a Codex workspace mutation.
- **Scene**: Script segment containing text, emotion, visual definition, and timing padding.
- **Timeline**: Generated frame ranges derived from audio duration and scene padding.
- **Real Mode**: Codex CLI App Server JSONL-over-stdio connection.
- **Mock Mode**: Deterministic local chat adapter for tests and demos.

## Component-Level Business Responsibilities

- **Electron Studio**: Creator-facing orchestration, review, status, and recovery UI.
- **Codex Boundary**: Conversation streaming, session resume, interruption, and explicit mutation approval.
- **Generation Core and CLI**: Validation, voice, timeline, preview, and render operations.
- **Remotion Composition**: Frame rendering, audio, subtitles, character, and scene visuals.
- **Local Persistence**: Input scripts, assets, chat/session state, generated metadata, and MP4 output.

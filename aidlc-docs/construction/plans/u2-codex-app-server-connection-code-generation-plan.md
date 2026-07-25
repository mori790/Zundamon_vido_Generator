# Code Generation Plan: U2 Codex App Server Connection

## Unit Context

- **Unit**: U2 Codex App Server Connection.
- **Goal**: Add a Codex panel to the Studio workspace shell with mock chat, local chat history persistence, Mock status display, and chat component tests.
- **Stories**: US-3 and US-4.
- **Dependencies**: U1 Studio app shell and workspace state.
- **Out of Scope**: Real Codex App Server protocol, JSON draft detection, action approval, script writes, command execution, preview, render.

## Target Code Locations

Application code:

- `src/studio/shared/chat.ts`
- `src/studio/renderer/chat-history-store.ts`
- `src/studio/renderer/mock-codex-connection.ts`
- `src/studio/renderer/CodexPanel.tsx`
- `src/studio/renderer/StudioApp.tsx`
- `src/studio/renderer/styles.css`
- `tests/studio/chat.test.ts`
- `tests/studio/CodexPanel.test.tsx`
- `tests/studio/StudioApp.test.tsx`

Documentation summary:

- `aidlc-docs/construction/u2-codex-app-server-connection/code/summary.md`

## Step-by-Step Generation Plan

### Step 1: Shared Chat Types and State Logic

- [x] Create `src/studio/shared/chat.ts`.
- [x] Define `CodexConnectionMode`, `CodexConnectionState`, `ChatRole`, `ChatMessage`, `ChatSession`, `CodexUserInput`, and `CodexConnection`.
- [x] Implement `createChatMessage()`.
- [x] Implement `appendChatMessage()`.
- [x] Implement `validateUserMessage()`.

### Step 2: Mock Codex Connection

- [x] Create `src/studio/renderer/mock-codex-connection.ts`.
- [x] Implement `MockCodexConnection` behind the `CodexConnection` interface.
- [x] Return `mock-ready` from `connect()`.
- [x] Reply after approximately 300ms.
- [x] Include planning-oriented assistant text.

### Step 3: Chat History Store

- [x] Create `src/studio/renderer/chat-history-store.ts`.
- [x] Implement `chatHistoryPath(videoId)`.
- [x] Implement `loadChatHistory(videoId)`.
- [x] Implement `saveChatHistory(videoId, messages)`.
- [x] Store under `generated/studio/{videoId}/chat-history.json`.
- [x] Keep persistence separate from `input/{videoId}.json`.

### Step 4: Codex Panel UI

- [x] Create `src/studio/renderer/CodexPanel.tsx`.
- [x] Implement `CodexPanel`, connection status, message list, message item, input form, and error banner.
- [x] Show explicit `Mock` status.
- [x] Load and save chat history by video ID.
- [x] Keep input enabled in mock mode.
- [x] Include stable `data-testid` attributes.

### Step 5: Integrate CodexPanel into WorkspaceShell

- [x] Update `src/studio/renderer/StudioApp.tsx`.
- [x] Add `CodexPanel` beside or below the workspace placeholder.
- [x] Pass current `videoId`, `workspace.mode`, and optional title context.
- [x] Preserve U1 start screen and workspace behavior.

### Step 6: Styling

- [x] Update `src/studio/renderer/styles.css`.
- [x] Add workspace layout that can host workspace content and Codex panel.
- [x] Add compact chat panel styles.
- [x] Ensure the UI stays app-like and readable.

### Step 7: Chat Unit Tests

- [x] Create `tests/studio/chat.test.ts`.
- [x] Test empty message validation.
- [x] Test message creation and append order.
- [x] Test mock connection state and response shape.

### Step 8: CodexPanel Component Tests

- [x] Create `tests/studio/CodexPanel.test.tsx`.
- [x] Test Mock status display.
- [x] Test user message submit.
- [x] Test assistant mock response appears.
- [x] Test empty input does not send.

### Step 9: Update Existing StudioApp Tests

- [x] Update `tests/studio/StudioApp.test.tsx` for the new workspace shell layout.
- [x] Assert Codex panel appears in opened workspace.
- [x] Ensure U1 tests still pass.

### Step 10: Code Summary

- [x] Create `aidlc-docs/construction/u2-codex-app-server-connection/code/summary.md`.
- [x] Summarize created and modified files.
- [x] Map implemented behavior to US-3 and US-4.

### Step 11: Verification

- [x] Run `npx tsc --noEmit`.
- [x] Run `npm test`.
- [x] Run `npm run studio:build`.
- [x] Run `npm run studio:dev -- --host 127.0.0.1` briefly if feasible.

## Story Traceability

- **US-3**: Covered by CodexPanel mock conversation inside workspace.
- **US-4**: Partially covered by connection state and panel-level error handling. Full real authentication failure handling belongs to real Codex integration.

## Approval Gate

This plan is the source of truth for U2 Code Generation. Code changes should not begin until this plan is approved.

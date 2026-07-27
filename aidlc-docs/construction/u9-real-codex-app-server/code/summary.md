# U9 Code Generation Summary

## Outcome

Zundamon Studio now uses the stable Codex App Server JSONL-over-stdio protocol through an Electron Main-owned process. Real mode is the default when the preload API is available; Mock remains explicit and available.

## Application Changes

- Shared bounded protocol, events, approvals, and monotonic state helpers: `src/studio/shared/codex-app-server.ts`.
- Main process lifecycle, initialize/thread/turn correlation, session resume, fail-closed approvals, retry, and redacted diagnostics: `src/studio/main/codex-app-server-service.ts`.
- Purpose-specific filesystem IPC and context-isolated preload: `src/studio/shared/local-file.ts`, `src/studio/main/local-file-service.ts`, `src/studio/main/preload.ts`.
- Real Renderer adapter, 50 ms display batching, transient incomplete output, Stop/reconnect/new-thread, and dedicated approval UI.
- Renderer Node integration removed; BrowserWindow uses `contextIsolation: true` and `nodeIntegration: false`.
- Electron 41.7.1, Vite 6.4.3, Vitest 4.1.10, fast-check 4.9.0, and esbuild 0.28.1 are exact dependencies.

## Story and Requirement Traceability

- US-3: Real streamed conversation through App Server.
- US-4: Connection errors, bounded retry, reconnect, and new-thread recovery.
- US-5: Completed Real responses reuse existing JSON proposal extraction.
- US-8: App Server mutation requests are separated from proposals and fail closed.

## Verification

- TypeScript, 125-test default example/PBT suite, Studio production build, context-isolated Electron asset E2E, and `npm audit` pass.
- Live Codex CLI 0.145.0 smoke passed for initialize, thread/start, turn/start, streamed deltas, and turn/completed (`U9_SMOKE_OK`).
- PBT failures report replayable fast-check seed/path through Vitest.

## Extension Compliance

- Security: SECURITY-03, 05, 06, 08-13, and 15 are compliant. SECURITY-01, 02, 04, 07, and 14 are N/A for this local non-networked tool.
- Resiliency: RESILIENCY-01-04, 10, 14, and 15 are compliant. RESILIENCY-05-09 and 11-13 are N/A for this local non-deployed tool.
- Property-Based Testing: PBT-01-08 and 10 are compliant through protocol/state properties, generators, shrinking, and seed replay. PBT-09 is compliant through exact fast-check 4.9.0 pinning.

## Limits

- Stable stdio protocol only; WebSocket and experimental App Server APIs are intentionally excluded.
- A turn is never automatically replayed after process loss.

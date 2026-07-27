# Logical Components: U9 Real Codex App Server Integration

## AppServerProcessHost

- Owns one child process and one process generation。
- Applies 5-second start and 10-second initialize timeout。
- Emits safe lifecycle events。
- Cleans stdin、stdout reader、stderr reader、exit listeners、timers on shutdown。

## ProtocolCodec

- Pure serialize/parse/validate boundary。
- Enforces 1 MiB line limit before JSON parse。
- Returns typed valid、ignored notification、invalid result。
- Has no process、filesystem、React dependency。

## RequestCorrelator

- Owns max 128 pending requests。
- Maps response ID to exactly one resolver。
- Rejects new work at capacity。
- Rejects all pending requests on generation change or shutdown。

## ConnectionCircuit

- Tracks closed、retrying、open、half-open。
- Schedules the three bounded retry delays。
- Never replays an in-flight turn。
- Accepts half-open probe only from explicit manual reconnect。

## TurnCoordinator

- Owns at most one active turn。
- Tracks item buffers and 50 ms batch timer。
- Flushes completion/terminal events immediately。
- Interrupts before Workspace switch and drops stale-generation events。

## ApprovalController

- Owns pending approval map and 5-minute timers。
- Produces bounded display summaries。
- Enforces first terminal decision and default deny。
- Denies all on disconnect/shutdown。

## WorkspaceSessionRepository

- Reads and atomically writes `codex-session.json`。
- Validates videoId、thread ID、metadata、file size。
- Does not auto-clear on resume failure。

## LocalFileService

- Replaces Renderer `window.require` filesystem access。
- Provides separate validated handlers for workspace、script、asset、chat、session。
- Resolves canonical paths from videoId/purpose, not Renderer target paths。

## CodexContextBridge

- Exposes frozen connect、send、stop、reconnect、disconnect、start-new-thread、approval response methods。
- Exposes typed event subscriptions with unsubscribe。
- Does not expose generic JSON-RPC or raw Node objects。

## StreamingViewReducer

- Pure reducer for connection、turn、item、progress、approval events。
- Preserves completion sequence。
- Marks partial terminal items transient and unpersisted。
- Supports stateful PBT against a simplified reference model。

## DiagnosticRing

- Stores at most 2,000 redacted metadata entries。
- Drops oldest entry on append at capacity。
- Clears on shutdown。

## Test Components

- Protocol domain arbitraries。
- Approval and turn stateful command models。
- Fake child process/line stream clock boundaries。
- Fault-injection harness for exit、timeout、malformed line、capacity、disconnect。
- Seed/path replay helper integrated with Vitest output。

## Cleanup Ownership

| Resource | Owner | Cleanup trigger |
|---|---|---|
| Child process | AppServerProcessHost | Disconnect、shutdown、fatal protocol error |
| Pending requests | RequestCorrelator | Response、timeout、generation change |
| Retry timers | ConnectionCircuit | Success、manual disconnect、shutdown |
| Delta batch timer | TurnCoordinator | Completion、terminal、Workspace switch |
| Approval timers | ApprovalController | Decision、disconnect、shutdown |
| IPC subscriptions | CodexContextBridge consumer | Component unmount、Workspace switch |
| Diagnostic entries | DiagnosticRing | Application shutdown |

## Dependency Direction

`ProtocolCodec` and pure reducers are dependency-free core components. Process、filesystem、clock、IPC are injected boundaries. Renderer depends only on typed bridge contracts. Main-process components never import React。

# Tech Stack Decisions

## Runtime and Package Management

| Decision | Selection | Rationale |
|---|---|---|
| Runtime | Any currently supported Node.js LTS version | Keeps setup flexible while avoiding unsupported runtimes. |
| Package manager | npm | Matches the specified command examples and reduces setup assumptions. |
| Language | TypeScript | Required by the specification and supports shared types. |
| CLI execution | `tsx` | Runs TypeScript scripts without a separate build step during local development. |

## Application Libraries

| Area | Selection | Rationale |
|---|---|---|
| Rendering | Remotion | Required by the specification for React-based video rendering. |
| UI layer | React | Required by Remotion and componentized rendering design. |
| Validation | Zod | Approved runtime validation source and type inference path. |
| HTTP | Native `fetch` where available | Supported in modern Node LTS and avoids extra dependency. |
| Hashing | Node `crypto` | Stable SHA-256 cache hashes without third-party code. |
| File system | Node `fs/promises` and `path` | Standard cross-platform file handling. |
| Audio duration | WAV metadata parser or lightweight audio duration library selected during Code Generation | Must provide reliable WAV duration in seconds. |
| Code highlighting | Lightweight syntax highlighting library selected during Code Generation | Needed for code visual scenes. |

## Remotion Integration

| Decision | Selection | Rationale |
|---|---|---|
| Render orchestration | Remotion Node APIs | Gives controlled render flow from TypeScript scripts. |
| Composition props | Load script, manifest, and timeline into typed input props | Keeps Remotion components data-driven and side-effect free. |
| Render verification | Manual render verification documented, not blocking in default tests | Avoids forcing heavy browser/FFmpeg rendering into normal test runs. |

## Testing

| Area | Selection | Rationale |
|---|---|---|
| Unit test runner | Vitest or equivalent modern TypeScript test runner selected during Code Generation | Fast local tests for pure functions and module behavior. |
| Integration tests | Live VOICEVOX integration test path | Matches requirement that VOICEVOX is a real runtime dependency. |
| Missing VOICEVOX in integration tests | Fail live integration tests | User selected this behavior. |
| Render integration | Manual or optional command | Remotion render is environment-heavy and not blocking by default. |

## Logging and Errors

| Decision | Selection | Rationale |
|---|---|---|
| Log levels | INFO, WARN, ERROR | Matches specification. |
| Default verbosity | Normal logs: major steps, cache hits, warnings, final output | Enough information for creators without noisy HTTP/file traces. |
| Error formatting | Domain errors mapped to Japanese CLI messages | Keeps user-facing failures actionable. |

## Rejected or Deferred Choices

| Choice | Status | Reason |
|---|---|---|
| pnpm or yarn | Rejected for MVP | npm is specified and selected. |
| Scene-level speaker overrides | Deferred | Functional Design selected video-level settings only. |
| Default blocking Remotion render tests | Rejected | Manual verification is documented instead. |
| Recorded VOICEVOX fixtures | Rejected for live integration path | User selected failure when engine is unavailable. |
| Multi-package repository | Rejected for MVP | One application package was selected. |


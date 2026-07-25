# Tech Stack Decisions: U1 Electron App Shell and Workspace Foundation

## Desktop Runtime

- **Decision**: Electron.
- **Rationale**: User selected a desktop app approach. Electron supports React UI, local files, and process execution needed by later GUI units.

## UI Framework

- **Decision**: React.
- **Rationale**: Existing project already uses React for Remotion components, and the GUI design selected React.

## File Access Strategy

- **Decision**: Renderer-side file access is acceptable for MVP, implemented behind narrow helper functions.
- **Rationale**: User selected MVP permissiveness. Helper boundaries preserve a future path to IPC-only access.

## Testing Stack

- **Decision**: Use Vitest for workspace state unit tests and add a minimal React component test setup for renderer components.
- **Rationale**: Existing project uses Vitest. U1 requires state and component tests, but not Electron E2E.

## Startup Strategy

- **Decision**: Start UI quickly, then load project summaries asynchronously.
- **Rationale**: MVP target is a few seconds to initial display and no heavy startup work.

## Out-of-Scope Tech Decisions

- Codex App Server transport details are deferred to U2.
- Command process management is deferred to U6.
- Embedded Remotion preview implementation details are deferred to U7.


# Tech Stack Decisions: U9 Real Codex App Server Integration

## Runtime

- **Electron**: Existing desktop runtimeを継続し、security-supported releaseへupgradeする。
- **Node.js**: Existing Node 20-compatible main process APIs。
- **React**: Existing Renderer UI。
- **TypeScript**: Shared protocol、IPC、state types。

## Codex Integration

- **Executable**: User-installed `codex` CLI。
- **Minimum version**: 0.145.0。
- **Transport**: `codex app-server --listen stdio://` equivalent default。
- **Process API**: Node `child_process.spawn` with `shell: false`。
- **Authentication**: Existing local Codex ChatGPT login state。
- **Compatibility check**: `codex --version` plus initialize handshake。

## Protocol Validation

- **Runtime schema**: Existing Zod 4.4.3。
- **Scope**: Stable methods/events used by U9 only。
- **Generated bindings**: Not used because current CLI marks schema generation experimental and U9 disabled experimental APIs。
- **Framing**: Node readline-style bounded JSONL reader with pre-parse byte limit。

## Electron Boundary

- `contextIsolation: true`。
- `nodeIntegration: false`。
- `contextBridge.exposeInMainWorld` for frozen purpose-specific APIs。
- Existing direct Renderer Node/filesystem access migrates to main IPC。

## Property-Based Testing

- **Framework**: `fast-check`。
- **Dependency type**: Exact-version devDependency selected during Code Generation and locked in `package-lock.json`。
- **Runner**: Existing Vitest。
- **Capabilities**: Domain generators、automatic shrinking、seed replay、stateful command/model testing。
- **Organization**: PBT files are clearly named/separated from example tests。
- **CI/local behavior**: Default `npm test` includes PBT and reports reproducible seed on failure。

## Logging

- Existing local Logger patternをreuseする。
- Bounded in-memory ring of 2,000 metadata entries。
- No persistent App Server protocol log。
- Correlation ID、event code、timestamp、level only。Content and credentials are redacted。

## Dependency Security

- `npm audit` is the selected scanner。
- Electron、Vite、Vitest upgradeはU9 Code Generation compatibility scope。
- No force audit fix。Explicit exact upgrades、typecheck、tests、Studio build、manual smokeでvalidateする。
- New `fast-check` comes from official npm registry and is exact-pinned。

## Rejected Choices

- WebSocket: experimental and unsupported for U9。
- Generic Renderer JSON-RPC API: violates least privilege。
- Custom random PBT helper: lacks required shrinking and seed semantics。
- Persistent raw protocol logs: unnecessary sensitive-data exposure。
- Experimental generated App Server schemas: conflicts with stable-only requirement。

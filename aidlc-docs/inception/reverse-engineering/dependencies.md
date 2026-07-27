# Dependencies

## Internal Dependency Flow

1. React Renderer depends on shared Studio contracts and preload APIs.
2. Preload depends on Electron IPC and shared contract types.
3. Electron Main depends on Main services and shared contracts.
4. Command Runner depends on existing npm/TypeScript scripts.
5. CLI scripts depend on core, schema, type, and utility modules.
6. Remotion composition depends on render data, React components, and public assets.
7. Tests depend on all layers through injected boundaries and fake processes.

## Production Dependencies

- `react`, `react-dom` 18.x - Studio and Remotion UI.
- `remotion` and `@remotion/renderer` 4.x - packaged preview/render runtime.

## Development and Test Dependencies

- `electron` 41.7.1 - desktop packaging/runtime source.
- `vite` 6.4.3 and `@vitejs/plugin-react` 4.x.
- `@remotion/cli`, `@remotion/player`, and `@remotion/bundler` 4.0.499.
- `zod` 4.4.3, bundled into production outputs.
- Electron Forge CLI/maker-zip 7.11.2.
- `typescript` 5.x and Node/React type packages.
- `tsx` 4.x.
- `esbuild` 0.28.1.
- `vitest` 4.1.10.
- `fast-check` 4.9.0.
- Testing Library and jsdom.

## External Runtime Dependencies

- Codex CLI executable and user login.
- VOICEVOX Engine for speech generation.
- macOS Finder for reveal workflow.

## Release Findings

- Main/Preload/CLI application code is bundled; actual Remotion runtime modules remain packaged.
- Codex and VOICEVOX remain external prerequisites and are diagnosed at runtime.
- Production-only audit reports zero vulnerabilities.
- Forge development tooling has a larger dependency graph but is not a production runtime dependency.

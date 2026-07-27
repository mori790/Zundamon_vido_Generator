# Dependencies

## Internal Dependency Flow

1. React Renderer depends on shared Studio contracts and preload APIs.
2. Preload depends on Electron IPC and shared contract types.
3. Electron Main depends on Main services and shared contracts.
4. Command Runner depends on existing npm/TypeScript scripts.
5. CLI scripts depend on core, schema, type, and utility modules.
6. Remotion composition depends on render data, React components, and public assets.
7. Tests depend on all layers through injected boundaries and fake processes.

## Runtime Dependencies

- `electron` 41.7.1 - desktop runtime.
- `react`, `react-dom` 18.x - Studio and Remotion UI.
- `vite` 6.4.3 and `@vitejs/plugin-react` 4.x - Studio Renderer build.
- `remotion`, `@remotion/cli`, `@remotion/player`, `@remotion/bundler`, `@remotion/renderer` 4.x/4.0.499 - preview/render pipeline.
- `zod` 4.4.3 - runtime script validation.

## Development and Test Dependencies

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

## Release-Relevant Findings

- Vite/esbuild/testing dependencies should not be shipped merely because they are currently top-level dependencies.
- The packaged application must either bundle required Main/Renderer code or include only actual runtime modules.
- `codex` and VOICEVOX are external prerequisites unless U10 explicitly chooses bundling or guided installation.
- Current `npm audit --audit-level=high` result is zero vulnerabilities.

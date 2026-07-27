# Technology Stack

## Languages and Runtime

- TypeScript/TSX 5.x, ES2022, strict mode.
- Node.js 20 development/runtime baseline.
- JSON and JSONL for script, generated state, and Codex transport.
- macOS desktop environment.

## Application Frameworks

- Electron 41.7.1.
- React and React DOM 18.x.
- Vite 6.4.3 with React plugin.
- Remotion CLI/player/runtime 4.0.499.
- Zod 4.4.3.

## Build Tools

- npm and package-lock.
- tsx 4.x for TypeScript CLI development execution and release script execution.
- esbuild 0.28.1 for production Main, Preload, CLI, and Electron E2E bundles.
- Electron Forge CLI 7.11.2 and maker-zip 7.11.2.
- TypeScript compiler for static verification.

## Testing

- Vitest 4.1.10.
- Testing Library React/Jest DOM.
- jsdom 24.x.
- fast-check 4.9.0.
- Native Electron E2E.

## External Local Services

- Codex CLI/App Server 0.145.0 or newer.
- VOICEVOX Engine 0.25.x.
- Remotion-managed browser/render stack.

## Packaging Status

- Electron Forge creates macOS 13+ arm64 `.app` and ZIP artifacts.
- Main, Preload, CLI, and Remotion are production-built before packaging.
- Minimal entitlements, Hardened Runtime, Developer ID signing, and notarytool configuration exist.
- Local verification generates CycloneDX SBOM, SHA-256, and release manifest.
- Auto-update, DMG/PKG, Mac App Store, x64, and Universal binaries are not implemented.

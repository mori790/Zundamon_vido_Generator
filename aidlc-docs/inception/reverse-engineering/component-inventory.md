# Component Inventory

## Packages

- **Application packages**: 1 (`zundamon-video-generator`).
- **Infrastructure packages**: 0.
- **Shared packages**: 0 separate packages; shared modules live inside `src/`.
- **Test packages**: 0 separate packages; tests live in `tests/`.

## Logical Components

1. Electron Main and window lifecycle.
2. Context-isolated preload bridge.
3. React Studio Renderer.
4. Codex App Server integration.
5. Purpose-specific local-file service.
6. Production command runner and logs.
7. Preview and render-output services.
8. Script draft, proposal, asset, and workspace domains.
9. CLI generation pipeline.
10. Remotion composition runtime.
11. Test suite, PBT suite, fake App Server, and Electron E2E.

## Infrastructure Inventory

- Cloud resources: none.
- Deployment manifests: none.
- Containers: none.
- CI/CD: none detected.
- Desktop package configuration: none.
- Signing/notarization configuration: none.
- Auto-update service: none.

## Test Inventory

- Default suite: 33 files and 125 tests.
- Live VOICEVOX integration: separate opt-in test.
- Electron E2E: context-isolated preload and asset workflow.
- Codex integration: protocol example/PBT, fake-process, Renderer adapter, and Real panel tests.

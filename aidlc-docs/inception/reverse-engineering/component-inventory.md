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
12. Workspace root persistence and First Run gate.
13. Codex/VOICEVOX dependency diagnosis.
14. Production resource resolver and packaged CLI adapter.
15. Forge packaging and release-artifact verifier.
16. Text draft input and persistence.
17. Codex-assisted scene segmentation and response validation.
18. Scene editor, per-scene asset assignment, and script builder.

## Infrastructure Inventory

- Cloud resources: none.
- Deployment manifests: none.
- Containers: none.
- CI/CD: none detected.
- Desktop package configuration: Electron Forge arm64 `.app` and ZIP.
- Signing/notarization configuration: conditional Developer ID, Hardened Runtime, entitlements, notarytool.
- Auto-update service: none.

## Test Inventory

- Default suite: 45 TypeScript/TSX test files; latest completed U12 run recorded 207 passing tests.
- Live VOICEVOX integration: separate opt-in test.
- Electron E2E: context-isolated preload and asset workflow.
- Codex integration: protocol example/PBT, fake-process, Renderer adapter, and Real panel tests.
- U10 integration: Workspace root, dependency diagnosis, resource resolution, release policy PBT, packaged render smoke.
- U12 coverage: draft persistence/validation, segmentation parsing, scene editing, asset assignment, script building, and Renderer tabs.

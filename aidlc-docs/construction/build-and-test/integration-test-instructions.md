# Integration Test Instructions

## Internal Acceptance Preflight Integration

Generate local artifacts first:

```bash
npm run release:local
```

Then run:

```bash
npm run acceptance:preflight
```

Expected result:

- all artifact gates pass.
- production dependency audit, typecheck, default tests, and Studio build all run.
- exit code is 0.

If `out/release-manifest.json` is absent, expected behavior is fail-closed with downstream gates marked `NOT RUN`.

## VOICEVOX Live Integration

Start VOICEVOX Engine on the default endpoint:

```bash
VOICEVOX_BASE_URL=http://localhost:50021
npm run test:integration
```

Expected result:

- live VOICEVOX connection succeeds.
- integration suite exits with code 0.

This test is environment-dependent and is not part of the default unit test suite.

## CLI Pipeline Integration

With VOICEVOX available:

```bash
npm run validate -- sample-video
npm run voice -- sample-video
npm run timeline -- sample-video
npm run preview -- sample-video
npm run render -- sample-video
```

Without VOICEVOX, use the developer-assisted smoke path:

```bash
npm run test:render
```

Expected result:

- script validation succeeds.
- timeline and preview generation succeed.
- MP4 output exists and is not 0 bytes.

## Packaged Runtime Integration

1. Run `npm run release:local`.
2. Open the local `.app` from the generated package output.
3. Select a clean Workspace folder.
4. Open `sample-video`.
5. Run Preview and Render.
6. Confirm output MP4 exists and can be played.
7. Record results in `docs/internal-acceptance/acceptance-evidence-template.md`.

## Cleanup

- Remove only disposable test Workspace folders.
- Preserve failed output artifacts when they are needed for debugging.
- Do not delete a user's real Workspace during integration cleanup.


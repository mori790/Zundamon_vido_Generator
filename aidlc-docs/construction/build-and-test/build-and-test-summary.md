# Build and Test Summary

## Build Status

- **Build Tool**: npm, TypeScript, Vite, esbuild, Remotion, Electron Forge.
- **TypeScript**: Success via `npm run typecheck`.
- **Studio Production Build**: Success through `npm run acceptance:preflight`.
- **Release Artifacts**: Present and verified by `npm run acceptance:preflight`.
- **Local Acceptance State**: Verified as `local-acceptance`.

## Test Execution Summary

### Unit Tests

- **Command**: `npm test`
- **Total Tests**: 143
- **Passed**: 143
- **Failed**: 0
- **Test Files**: 38 passed
- **Coverage**: Not measured
- **Status**: Pass

### Focused U11 Tests

- **Command**: `npx vitest run tests/studio/acceptance-preflight.test.ts`
- **Total Tests**: 8
- **Passed**: 8
- **Failed**: 0
- **Status**: Pass

### Integration Tests

- **Internal Acceptance Preflight Fail-Closed**: Pass. Earlier verification confirmed missing artifacts fail closed and preserve downstream gates as `NOT RUN`.
- **Internal Acceptance Preflight Real Artifact Path**: Pass. User ran `npm run acceptance:preflight` after artifact generation; release manifest, arm64 ZIP, SBOM, ZIP SHA-256, release state, production dependency audit, typecheck, default tests, and Studio build all passed.
- **VOICEVOX Live Integration**: Not Run. Requires running VOICEVOX Engine.
- **Real Packaged Artifact Success Path**: Not Run. Requires `npm run release:local` artifacts.
- **Status**: Partial Pass with environment-dependent items documented.

### Performance Tests

- **Fail-Closed Preflight**: Pass for missing artifact path because heavy gates did not run.
- **Real Artifact Preflight**: Pass. All gates completed successfully.
- **Render Wall Time**: Not Run in this stage.
- **Cold Start p95**: Not Run. Requires manual packaged app measurement.
- **Workspace Restore p95**: Not Run. Requires manual packaged app measurement.
- **Multi-user Load**: N/A for local single-user desktop app.
- **Status**: Partial Pass with manual measurements deferred.

### Additional Tests

- **Contract Tests**: N/A. U11 adds no network API contract.
- **Security Tests**: Pass. Focused tests passed and production dependency audit passed during real-artifact preflight.
- **E2E Tests**: Instructions generated. Clean-profile smoke remains Not Run until a clean Mac or clean macOS user profile is used.

## Generated Instruction Files

- `aidlc-docs/construction/build-and-test/build-instructions.md`
- `aidlc-docs/construction/build-and-test/unit-test-instructions.md`
- `aidlc-docs/construction/build-and-test/integration-test-instructions.md`
- `aidlc-docs/construction/build-and-test/performance-test-instructions.md`
- `aidlc-docs/construction/build-and-test/security-test-instructions.md`
- `aidlc-docs/construction/build-and-test/e2e-test-instructions.md`
- `aidlc-docs/construction/build-and-test/build-and-test-summary.md`

## Extension Compliance

| Extension | Result | Rationale |
|---|---|---|
| Security Baseline | Compliant | Security instructions require preflight, manifest, checksum, SBOM, architecture, release-state, production audit, focused redaction tests, and public-release blocking evidence. |
| Resiliency Baseline | Compliant | Build/test instructions preserve fail-closed behavior, `NOT RUN` downstream gates, non-destructive rollback, Workspace preservation, and environment-dependent test classification. |
| Property-Based Testing (U11 Partial) | Compliant | Focused PBT for new pure helpers is documented and passed. Higher-run PBT replay remains available through existing scripts. |

## Overall Status

- **Build**: Instruction set complete. TypeScript validation passed.
- **Automated Tests**: Pass.
- **Internal Acceptance Preflight**: Fail-closed behavior verified for missing artifacts.
- **Local Acceptance Handoff**: Ready for clean-profile smoke. Real-artifact `npm run acceptance:preflight` passed.
- **Ready for Operations Placeholder**: Yes.

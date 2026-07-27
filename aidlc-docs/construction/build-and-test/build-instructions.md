# Build Instructions

## Prerequisites

- **Build Tool**: npm with Node.js 20 or later.
- **Target OS**: macOS 13 or later on Apple Silicon for desktop packaging.
- **Dependencies**: npm dependencies from `package-lock.json`.
- **Optional Runtime Service**: VOICEVOX Engine at `http://localhost:50021` for live voice generation tests.
- **Public Release Credentials**: Apple Developer signing identity and notarytool Keychain profile. These are not required for U11 local-acceptance work.

## Build Steps

### 1. Install Dependencies

```bash
npm ci
```

Use `npm install` only when intentionally updating dependency state. Do not run `npm audit fix --force` as part of routine build recovery.

### 2. Typecheck

```bash
npm run typecheck
```

Expected result: TypeScript exits with code 0.

### 3. Build Desktop Studio

```bash
npm run studio:build
```

Expected artifacts:

- `dist-studio/`
- `dist-cli/`
- `dist-remotion/`

### 4. Package Local Desktop Artifact

```bash
npm run package
```

Expected artifact:

- `out/Zundamon Video Generator-darwin-arm64/`

### 5. Generate Local Acceptance Release Artifacts

```bash
npm run release:local
```

Expected artifacts:

- arm64 `.app`
- arm64 ZIP under `out/make/zip/darwin/arm64/`
- `out/release-sbom.cdx.json`
- `out/release-manifest.json`

The expected release state for U11 internal adoption is `local-acceptance`. This state is not publishable and must not be treated as public distribution approval.

### 6. Run Internal Acceptance Preflight

```bash
npm run acceptance:preflight
```

Expected result when artifacts exist and all gates pass:

- release manifest is readable.
- ZIP exists and SHA-256 matches manifest.
- SBOM exists.
- architecture is `arm64`.
- release state is `local-acceptance`.
- production dependency audit passes.
- typecheck passes.
- default tests pass.
- Studio build passes.

If artifact gates fail, preflight exits non-zero before running heavier audit, typecheck, test, or build gates.

## Troubleshooting

### Dependency Install Fails

- Confirm network access to npm registry.
- Re-run `npm ci` after network is available.
- Keep `package-lock.json` as the source of dependency truth.

### Typecheck Fails

- Fix the first reported TypeScript error.
- Re-run `npm run typecheck`.
- Re-run the focused test that covers the changed code.

### Studio Build Fails

- Confirm Electron, Vite, esbuild, and Remotion dependencies are installed.
- Re-run `npm run studio:build`.
- Check `dist-studio/`, `dist-cli/`, and `dist-remotion/` output paths.

### Acceptance Preflight Fails on Missing Artifacts

- Run `npm run release:local`.
- Re-run `npm run acceptance:preflight`.
- Do not bypass missing manifest, missing SBOM, checksum mismatch, wrong architecture, or wrong release state.


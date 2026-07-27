# Security Test Instructions

## Automated Security Gates

Run after local release artifacts exist:

```bash
npm run acceptance:preflight
```

This command includes:

- release manifest presence and schema validation.
- ZIP existence and SHA-256 match.
- SBOM presence.
- `arm64` architecture check.
- `local-acceptance` release state check.
- production dependency audit through `npm audit --omit=dev`.
- typecheck.
- default tests.
- Studio build.

## Focused Security Checks

```bash
npx vitest run tests/studio/acceptance-preflight.test.ts
```

Expected coverage:

- missing artifact fails closed.
- checksum mismatch fails closed.
- wrong architecture fails closed.
- wrong release state fails closed.
- reports never mark internal acceptance artifacts as publishable.
- credential-like query values are redacted.
- `/Users/<name>` paths are redacted in evidence output.

## Manual Artifact Review

```bash
shasum -a 256 out/make/zip/darwin/arm64/*.zip
```

Compare the output with `out/release-manifest.json`.

For future public release only:

```bash
codesign --verify --deep --strict 'out/Zundamon Video Generator-darwin-arm64/Zundamon Video Generator.app'
xcrun stapler validate 'out/Zundamon Video Generator-darwin-arm64/Zundamon Video Generator.app'
spctl --assess --type execute --verbose=2 'out/Zundamon Video Generator-darwin-arm64/Zundamon Video Generator.app'
```

U11 internal adoption does not approve public distribution. Public release remains blocked until signing, notarization, stapling, Gatekeeper assessment, manifest, checksum, and SBOM evidence all pass.

## Secret Handling

- Do not paste Apple credentials, Codex tokens, API keys, or user personal paths into evidence files.
- Prefer relative paths in evidence.
- When an absolute macOS user path is necessary, redact the username segment.


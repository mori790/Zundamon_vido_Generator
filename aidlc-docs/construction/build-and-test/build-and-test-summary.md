# Build and Test Summary

## Build Status

- TypeScript: success
- Studio production build: success
- Electron Forge arm64 package／make: success
- Artifacts: `.app`、261 MiB ZIP、CycloneDX SBOM、SHA-256、release manifest
- Release state: `local-acceptance`

## Test Execution

### Unit／Property Tests

- 37 test files、135 tests passed、0 failed
- Release PBT: 2 files、8 properties、各1,000 run passed
- `PBT_SEED`によるseed replayを用意
- Coverage percentage: 未計測

### Integration／E2E

- Electron context-isolated E2E: passed
- Packaged CLI: 742 framesのMP4 render passed
- Workspace、dependency diagnosis、release policy integration: passed
- VOICEVOX live integration: environment依存のため今回未実行

### Performance

- ZIP size gate: 261 MiB、warning、blockingなし
- Codex 5秒／VOICEVOX 3秒timeout: test passed
- cold start p95 5秒／Workspace復元p95 2秒: manual measurement未実行
- multi-user load／stress: local single-user appのためN/A

### Security

- Production dependency audit: 0 vulnerabilities
- Artifact inclusion、SBOM、checksum、manifest: passed
- 未署名public verification: codesignで拒否、fail closed
- 実署名／公証／staple／Gatekeeper: Apple credential未提供のためdeferred

## Extension Compliance

### Security Baseline

- SECURITY-05、09、10、12、13、15: compliant
- SECURITY-01〜04、06〜08、11、14: local desktop applicationで該当resource／authentication／network serviceがないためN/A
- Blocking finding: なし

### Resiliency Baseline

- Atomic Workspace保存、failure containment、timeout、manual retry、rollback／recovery: compliant
- Cloud HA、multi-region DR、central observability: local single-user applicationのためN/A
- Blocking finding: なし

### Property-Based Testing

- PBT-08: shrinking、seed表示、`PBT_SEED` replay、release 1,000 runに対応しcompliant
- PBT-01〜07、09、10: Code Generation成果物とfast-check suiteでcompliant
- Blocking finding: なし

## Overall Status

- Build: success
- Automated tests: pass
- Local acceptance: ready
- Public distribution: not ready。Apple署名・公証証跡が揃うまでblocked
- Operations placeholderへ進行可能

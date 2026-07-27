# Build and Test Summary

## Result

- TypeScript: passed。
- Default suite: 33 files、125 tests passed。
- Studio production build: passed。
- Sample validation: passed。
- Actual Render: 567 frames、18.5 seconds、約1.5 MB non-zero MP4。
- Preview: Remotion Studio server ready、build passed。
- GUI manual: overwrite、Stop/partial warning、retry、Finder reveal passed。

## Coverage

- U1 Workspace and Electron shell。
- U2 Codex panel boundary。
- U3 JSON draft review and scene editing。
- U4 proposal approval flow。
- U5 asset selection。
- U6 Command Runner and logs。
- U7 embedded Preview。
- U8 Render workflow and CLI compatibility。
- U9 Real Codex App Server、context-isolated IPC、stream、resume、Stop、approval、recovery。

## Environmental Checks

- VOICEVOX、native Electron/Finder、actual mediaはlocal environment依存。
- 4K/60fps/30分capacity testは未実行で、hardware別のmanual measurement対象。
- Dependency auditは0件。force fixは未使用。

## Extension Compliance

- Security Baseline: applicable rules compliant。Local non-networked項目はN/A。
- Resiliency Baseline: bounded retry、timeout、non-replay、cleanup、recovery tests compliant。Distributed deployment項目はN/A。
- Property-Based Testing: full mode compliant。fast-check 4.9.0でround-trip、bounds、terminal/approval monotonicity、shrinking、seed replayを検証。

## Overall Status

Build and Test complete。Operations placeholderへ進行可能。

## U9 Verification

- TypeScript、125-test example/PBT suite、Studio build、context-isolated Electron E2E passed。
- Live Codex App Server initialize、thread start/resume、turn start、stream、interrupt completion passed。
- Dependency audit: 0 vulnerabilities after sequential exact upgrades。
- Fake-process integration: approval deny/timeout、process exit、bounded retry、manual half-open recovery passed。

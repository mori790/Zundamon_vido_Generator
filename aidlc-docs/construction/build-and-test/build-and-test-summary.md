# Build and Test Summary

## Result

- TypeScript: passed。
- Default suite: 28 files、112 tests passed。
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

## Environmental Checks

- VOICEVOX、native Electron/Finder、actual mediaはlocal environment依存。
- 4K/60fps/30分capacity testは未実行で、hardware別のmanual measurement対象。
- Dependency auditは6件（moderate 3、high 2、critical 1）。breaking changeを伴うforce fixは未実行。

## Extension Compliance

- Security Baseline: N/A（disabled）。
- Resiliency Baseline: N/A（disabled）。
- Property-Based Testing: N/A（disabled）。

## Overall Status

Build and Test complete。Operations placeholderへ進行可能。

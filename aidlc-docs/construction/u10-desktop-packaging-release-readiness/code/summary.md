# U10 Code Generation Summary

## Outcome

Electron Forge 7.11.2でmacOS 13以降のarm64 `.app`とZIPを生成できるようにした。成果物はCodex CLI／VOICEVOXを同梱せず、利用者が選択したWorkspaceを唯一のproject rootとして使用する。

## Main Changes

- Production Renderer、Main、Preload、CLI、Remotion bundleをbuildし、ASAR外のRemotion実行binaryを固定パスで使用する。
- Workspace選択、canonical path検証、必須directory作成、atomic参照保存、First Run UIを追加した。
- CodexとVOICEVOXの独立診断、timeout、action code、日本語status UIを追加した。
- Forge arm64 ZIP、custom icon、最小entitlements、Hardened Runtime／notarization設定を追加した。
- Local acceptanceとpublic releaseを分離し、SBOM、SHA-256、manifest、容量／inclusion／Apple検証gateを追加した。
- Install、外部依存・privacy、update／rollback／recovery、release checklistを日本語で作成した。

## Traceability

- US-1〜US-3: ZIP導入、First Run、Workspace復元
- US-4〜US-6: Codex／VOICEVOX診断、manual update／rollback
- US-7〜US-9: Local package、packaged flow、signing／notarization設定
- US-10〜US-12: Public gate、SBOM／checksum／manifest、再現可能な検証command

## Verification

- TypeScript typecheck: pass
- Default test: 37 files、135 tests pass
- Release PBT: 2 files、8 properties、各1,000 run pass
- Electron E2E: pass
- Production dependency audit: high／criticalを含め0 vulnerabilities
- Packaged CLI smoke: 742 framesの`sample-video.mp4`生成に成功
- arm64 ZIP: 261 MiB。200 MiB warning、300 MiB blockingの範囲内
- SHA-256: `ff52f6586b61545abae563329d3c5bd86937a60236fced7a287e38b3f86244cf`
- SBOM: CycloneDX JSON生成済み
- Release state: `local-acceptance`

## Security／Resiliency／PBT Compliance

- **Security: compliant** — context isolation、typed IPC、canonical path境界、credential非出力、最小entitlements、production audit、SBOM、checksum、fail-closed public gateを確認した。
- **Resiliency: compliant** — atomic Workspace保存、外部依存のfailure containment、manual retry、partial output維持、rollback／recovery手順を確認した。
- **PBT: compliant** — Workspace round-trip／idempotence、release state、manifest、artifact allowlistを通常100 run／release 1,000 runで確認した。
- **N/A** — Cloud IAM、HA／DR、multi-user authentication、central monitoringはlocal desktop applicationのため対象外。

## Deferred Public Release

Apple Developerの署名identityとnotary credentialは提供されていないため、実署名・公証は未実行である。`npm run verify:release`は未署名成果物をcodesign検証で拒否した。一般配布は署名、公証、staple、Gatekeeper検証がすべて成功するまで禁止する。

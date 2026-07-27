# Performance Test Instructions

## Requirements

- cold start p95: 5秒以内
- Workspace復元 p95: 2秒以内
- Codex診断timeout: 5秒
- VOICEVOX診断timeout: 3秒
- ZIP: 200 MiB超で警告、300 MiB超で失敗
- 同時Render: 1

## Measurement

同一Apple Silicon端末でcold startとWorkspace復元を各20回測定し、昇順19番目をp95として記録する。Activity Monitorでpeak memoryも記録する。

Renderは次でwall timeと成果物sizeを測る。

```bash
time npm run test:render
ls -lh output/sample-video.mp4
```

Local releaseの容量gateは次で確認する。

```bash
npm run verify:package
```

## Current Evidence

- パッケージ内CLIで742 framesのrender成功
- ZIP 261 MiB: warning、blockingなし
- Codex／VOICEVOX timeoutはfake adapter testで確認
- cold startとWorkspace復元の20回p95実測は未実行

Local single-user applicationのためmulti-user throughput／stress testはN/Aである。対象hardwareを変更する場合はcold start、Workspace復元、render time、peak memoryを再測定する。

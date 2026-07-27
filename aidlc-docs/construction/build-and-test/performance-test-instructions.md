# Performance Test Instructions

## Current Baseline

- `sample-video`: 567 frames、30fps。
- Observed actual Render: 18.5 seconds、約1.5 MB MP4。
- Application-level Render concurrency: 1。
- Frame concurrency: Remotion internal concurrency。

## Measurement

```bash
time npm run render -- sample-video
```

1回目とcached Voiceを使用する2回目を比較する。progressがmonotonic、ETAが更新され、final 100%とnon-zero outputになることを確認する。

## Capacity Boundary

4K、60fps、30分は専用sampleと十分なhardwareで手動測定する。現在は保証値を設けず、render time、peak memory、output sizeを記録する。

## U9 Interactive Limits

- Prompt: 64 KiB。
- JSONL line and assistant item: 1 MiB。
- Pending requests: 128。
- Diagnostic ring: 2,000 entries。
- Renderer stream update: 50 ms batching、terminal eventは即時処理。

Local single-user applicationのためthroughput load testはN/A。上記境界はexample/PBT/fake-process testsで検証する。

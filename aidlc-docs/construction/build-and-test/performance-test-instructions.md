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

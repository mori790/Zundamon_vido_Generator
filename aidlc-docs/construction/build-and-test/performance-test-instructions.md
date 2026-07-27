# Performance Test Instructions

## Applicable Requirements

- Internal acceptance preflight artifact gates should fail quickly before heavier commands when release artifacts are missing or invalid.
- Desktop app usage is local and single-user.
- Concurrent render remains limited to one render at a time.
- Large ZIP artifacts should remain reviewable before internal handoff.

## Measurement Commands

Measure sample render wall time:

```bash
time npm run test:render
ls -lh output/sample-video.mp4
```

Measure local release package size:

```bash
npm run release:local
ls -lh out/make/zip/darwin/arm64/*.zip
```

Run preflight after artifacts exist:

```bash
npm run acceptance:preflight
```

## Manual Desktop Measurements

On an Apple Silicon Mac:

1. Launch the packaged `.app` 20 times from a clean state.
2. Record cold start time for each run.
3. Reopen an existing Workspace 20 times.
4. Record Workspace restore time for each run.
5. Sort each measurement set and use the 19th value as p95.
6. Record peak memory during Preview and Render using Activity Monitor.

## Current U11 Evidence

- `npm run acceptance:preflight` fail-closed path completed before heavy gates when `out/release-manifest.json` was absent.
- Focused tests cover all-gates-pass behavior through injected command runners.
- Full real-artifact preflight performance was not run because local release artifacts were not present.

## N/A Items

- Multi-user throughput is N/A for a local single-user desktop app.
- Cloud load, regional failover, and distributed stress tests are N/A because U11 adds no cloud infrastructure.


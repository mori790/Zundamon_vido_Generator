# Performance Test Instructions

## Purpose

Validate MVP performance for local video generation.

## Performance Requirements

- A 3-minute video should render in under 10 minutes on a typical modern Mac.
- The architecture should support roughly 10-minute videos without redesign.
- Re-running unchanged scripts should reuse cached WAV files.

## Setup

1. Start VOICEVOX Engine.
2. Prepare a 3-minute script JSON with representative scenes and visuals.
3. Confirm dependencies are installed.

```bash
npm install
npm run validate -- sample-video
```

## Run Performance Test

Use shell timing around the full video command:

```bash
time npm run video -- sample-video
```

Run the command twice:

1. First run measures full generation cost.
2. Second run measures cached voice behavior.

## Analyze Results

- Confirm total wall-clock time for a 3-minute script is under 10 minutes.
- Confirm the second run logs cache hits for unchanged voice files.
- Confirm output MP4 is complete and playable.

## Optimization Follow-Up

If the target is not met:

1. Confirm cache hits are working.
2. Check whether VOICEVOX synthesis or Remotion render is the bottleneck.
3. Reduce unnecessary render attempts before validation and timeline success.
4. Consider future parallel voice generation outside MVP.


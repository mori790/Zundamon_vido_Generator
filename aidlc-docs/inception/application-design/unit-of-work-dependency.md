# Unit of Work Dependencies

## Dependency Strategy

Implementation proceeds sequentially. Each unit builds on outputs from previous units.

| Unit | Depends On | Enables |
|---|---|---|
| U1 Project Foundation and Shared Types | None | All later units |
| U2 Script Validation, Assets, and Path Safety | U1 | U3, U4, U6, U7 |
| U3 VOICEVOX Audio Generation and Cache | U1, U2 | U4, U6, U7 |
| U4 Audio Measurement and Timeline Generation | U1, U2, U3 | U5, U6, U7 |
| U5 Remotion Composition and Scene Rendering | U1, U2, U4 | U6, U7 |
| U6 CLI Orchestration and Render Integration | U1, U2, U3, U4, U5 | U7 |
| U7 Tests, Sample Data, Placeholder Assets, and Documentation | U1, U2, U3, U4, U5, U6 | MVP verification |

## Critical Path

1. U1 must be completed first because all modules need types and project configuration.
2. U2 must precede generation and rendering because invalid scripts and unsafe paths must be rejected at boundaries.
3. U3 must precede U4 because timeline generation needs measured audio durations in manifest data.
4. U4 must precede U5 because scene rendering depends on frame timeline data.
5. U5 must precede U6 final render orchestration because the render service needs a composition to render.
6. U7 finalizes verification after implementation paths exist.

## Parallelization

Limited parallelization is possible after U1 and U2:

- Some Remotion component styling in U5 can be prepared while U3 and U4 are implemented, as long as placeholder render data is used.
- README drafts and sample JSON in U7 can be prepared early.
- Final tests in U7 depend on completed units and should run after U6.

## Integration Checkpoints

| After Unit | Checkpoint |
|---|---|
| U2 | `npm run validate -- sample-video` can report script and asset status. |
| U3 | `npm run voice -- sample-video` can generate or cache WAV files when VOICEVOX is running. |
| U4 | Timeline JSON can be generated from measured audio. |
| U5 | Remotion preview can display scenes from render data. |
| U6 | `npm run video -- sample-video` can orchestrate the full flow. |
| U7 | Unit and lightweight integration tests pass; README explains manual MP4 verification. |

## Risk Notes

- VOICEVOX availability is an environment dependency; integration tests should distinguish unavailable engine from code failure.
- Remotion render may require local FFmpeg/browser dependencies; build instructions must document expected setup.
- Placeholder assets reduce first-run friction but should be clearly replaceable with real character art.


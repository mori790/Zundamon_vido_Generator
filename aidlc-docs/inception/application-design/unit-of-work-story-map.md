# Unit of Work Story Map

## Story Assignment Rule

Each story is assigned to a primary owning unit. Secondary dependencies list supporting units that the story touches but does not primarily belong to.

## Story Map

| Story | Priority | Primary Unit | Secondary Dependencies |
|---|---:|---|---|
| US-001 Validate a script before generation | A | U2 Script Validation, Assets, and Path Safety | U1, U6, U7 |
| US-002 Generate VOICEVOX narration for each scene | A | U3 VOICEVOX Audio Generation and Cache | U1, U2, U6, U7 |
| US-003 Reuse cached narration | A | U3 VOICEVOX Audio Generation and Cache | U1, U4, U6, U7 |
| US-004 Measure audio and generate scene timeline | A | U4 Audio Measurement and Timeline Generation | U1, U2, U3, U6, U7 |
| US-005 Render synchronized subtitles | A | U5 Remotion Composition and Scene Rendering | U1, U4, U7 |
| US-006 Render fixed character art | A | U5 Remotion Composition and Scene Rendering | U1, U2, U7 |
| US-007 Render MP4 from one command | A | U6 CLI Orchestration and Render Integration | U1, U2, U3, U4, U5, U7 |
| US-008 Switch character expressions by scene | B | U5 Remotion Composition and Scene Rendering | U1, U2, U7 |
| US-009 Display explanation images | B | U5 Remotion Composition and Scene Rendering | U1, U2, U7 |
| US-010 Show title and ending scenes | B | U5 Remotion Composition and Scene Rendering | U1, U2, U7 |
| US-011 Report actionable errors and logs | B | U6 CLI Orchestration and Render Integration | U1, U2, U3, U4, U5, U7 |
| US-012 Animate simple lip sync | C | U5 Remotion Composition and Scene Rendering | U1, U4, U7 |
| US-013 Display code scenes | C | U5 Remotion Composition and Scene Rendering | U1, U2, U7 |
| US-014 Play optional BGM | C | U5 Remotion Composition and Scene Rendering | U1, U2, U6, U7 |
| US-015 Highlight subtitle keywords | C | U5 Remotion Composition and Scene Rendering | U1, U2, U7 |

## Coverage Validation

- All 15 user stories are assigned to one primary unit.
- Priority A stories cover validation, voice generation, cache, timeline, subtitles, character rendering, and full MP4 generation.
- Priority B stories are concentrated in rendering and CLI error/reporting behavior.
- Priority C stories are mostly rendering enhancements plus sample/test coverage.

## Unit Coverage Summary

| Unit | Primary Stories | Role |
|---|---|---|
| U1 Project Foundation and Shared Types | None primary | Foundation for all stories |
| U2 Script Validation, Assets, and Path Safety | US-001 | Input and safety boundary |
| U3 VOICEVOX Audio Generation and Cache | US-002, US-003 | Narration generation |
| U4 Audio Measurement and Timeline Generation | US-004 | Timing model |
| U5 Remotion Composition and Scene Rendering | US-005, US-006, US-008, US-009, US-010, US-012, US-013, US-014, US-015 | Viewer-facing output |
| U6 CLI Orchestration and Render Integration | US-007, US-011 | User command workflow |
| U7 Tests, Sample Data, Placeholder Assets, and Documentation | None primary | Verification and onboarding |

## Extension Compliance Summary

- Security Baseline: N/A. Disabled during Requirements Analysis.
- Resiliency Baseline: N/A. Disabled during Requirements Analysis.
- Property-Based Testing: N/A. Disabled during Requirements Analysis.


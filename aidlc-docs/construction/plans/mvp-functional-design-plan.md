# MVP Functional Design Plan

## Context

Functional Design will cover all seven MVP units as one grouped pass. The focus is detailed business logic, domain entities, validation rules, data transformations, error scenarios, and frontend component behavior. Infrastructure concerns are out of scope.

## Planning Checklist

- [x] Load unit of work definitions.
- [x] Load unit dependency map.
- [x] Load story map.
- [x] Identify functional design areas across all units.
- [x] Collect user answers for functional design choices.
- [x] Analyze answers for ambiguity.
- [x] Obtain explicit approval of this functional design plan.

## Generation Checklist

- [x] Generate `aidlc-docs/construction/mvp/functional-design/business-logic-model.md`.
- [x] Generate `aidlc-docs/construction/mvp/functional-design/business-rules.md`.
- [x] Generate `aidlc-docs/construction/mvp/functional-design/domain-entities.md`.
- [x] Generate `aidlc-docs/construction/mvp/functional-design/frontend-components.md`.
- [x] Validate functional design coverage against all seven units and all 15 stories.
- [x] Update this plan's checkboxes immediately after each completed generation step.

## Functional Areas

- Script parsing and validation.
- Public asset reference resolution and asset checks.
- VOICEVOX voice generation and cache decisions.
- WAV duration measurement and timeline frame calculation.
- Subtitle splitting and visibility rules.
- Character expression selection, lip sync, and motion rules.
- Visual rendering for image, code, text, title, ending, BGM, and keyword highlighting.
- CLI command orchestration and Japanese error/log output.

## Questions

## Question 1
How should scene-level speaker overrides be handled in MVP?

A) Support video-level speaker settings only, matching the main specification tables

B) Support both video-level settings and optional scene-level speaker overrides

C) Defer speaker override handling entirely and hardcode defaults

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
How should development placeholder character assets behave?

A) Always allow bundled placeholders when real character files are missing

B) Allow placeholders only for sample videos, but require real assets for user-created videos

C) Treat placeholders as a setup helper only; validation should fail if real assets are missing

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 3
How strict should visual asset validation be for MVP?

A) Missing scene visual images are blocking errors; missing optional BGM is a warning

B) Missing scene visual images and missing BGM are warnings

C) Missing any configured asset is a blocking error

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 4
How should long subtitles be treated during rendering?

A) Apply shrink-to-fit and allow up to 3 lines, then warn if still long

B) Keep the configured font size and warn only

C) Split long subtitles into multiple timed chunks

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 5
How should VOICEVOX integration tests behave when VOICEVOX Engine is not running?

A) Skip the live integration test with a clear message

B) Fail the integration test because VOICEVOX is a required dependency

C) Use recorded HTTP fixtures instead of live VOICEVOX

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Approval

After answering all questions above, approve or request changes to this functional design plan.

[Answer]: approve

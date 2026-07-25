# MVP NFR Design Plan

## Context

NFR Design will translate the approved NFR requirements into implementation patterns and logical components. The application remains a local CLI and Remotion project with no cloud infrastructure.

## Planning Checklist

- [x] Load NFR requirements.
- [x] Load tech stack decisions.
- [x] Identify NFR design patterns and logical components.
- [x] Collect user answers for NFR design choices.
- [x] Analyze answers for ambiguity.
- [x] Obtain explicit approval of this NFR design plan.

## Generation Checklist

- [x] Generate `aidlc-docs/construction/mvp/nfr-design/nfr-design-patterns.md`.
- [x] Generate `aidlc-docs/construction/mvp/nfr-design/logical-components.md`.
- [x] Validate NFR design coverage against approved NFR requirements.
- [x] Update this plan's checkboxes immediately after each completed generation step.

## NFR Design Areas

- Domain error and log formatting patterns.
- Path normalization and public asset boundary pattern.
- Cache manifest consistency and partial progress pattern.
- VOICEVOX HTTP failure handling pattern.
- Render orchestration and failure wrapping pattern.
- Optional heavy render verification pattern.
- Test command separation for unit, live integration, and manual render verification.

## Questions

## Question 1
How should VOICEVOX HTTP failures be handled?

A) No retry for MVP; fail fast with scene context and clear Japanese message

B) Retry transient HTTP failures up to 2 times, then fail with context

C) Retry all VOICEVOX failures until a timeout is reached

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
How should generated manifest and timeline JSON writes be made reliable?

A) Write to a temporary file and rename into place

B) Write directly to the target JSON file

C) Keep in memory only until the whole command succeeds

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 3
How should optional Remotion render verification be exposed?

A) Document manual `npm run video -- sample-video` verification only

B) Add an optional npm script such as `npm run test:render`

C) Include render verification in normal `npm test`

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 4
How should verbose logging be enabled?

A) Environment variable such as `LOG_LEVEL=debug`

B) CLI flag such as `--verbose`

C) Do not add verbose logging in MVP

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Approval

After answering all questions above, approve or request changes to this NFR design plan.

[Answer]: approve

# MVP NFR Requirements Plan

## Context

NFR Requirements will cover the full MVP as one grouped pass. The focus is performance, reliability, security posture, maintainability, usability, and technology stack decisions for a local macOS CLI and Remotion application.

## Planning Checklist

- [x] Load functional design artifacts.
- [x] Identify NFR-sensitive workflows and decisions.
- [x] Identify required technology stack decisions.
- [x] Collect user answers for NFR choices.
- [x] Analyze answers for ambiguity.
- [x] Obtain explicit approval of this NFR requirements plan.

## Generation Checklist

- [x] Generate `aidlc-docs/construction/mvp/nfr-requirements/nfr-requirements.md`.
- [x] Generate `aidlc-docs/construction/mvp/nfr-requirements/tech-stack-decisions.md`.
- [x] Validate NFR coverage for performance, reliability, security, maintainability, usability, and testing.
- [x] Update this plan's checkboxes immediately after each completed generation step.

## NFR Areas

- Local CLI performance for roughly 10-minute videos.
- Voice generation cache behavior and partial progress preservation.
- Safe path handling for user-controlled JSON.
- Remotion render reliability and error reporting.
- VOICEVOX availability as an explicit dependency.
- Unit and live integration testing scope.
- Maintainable module boundaries and type-safe validation.

## Questions

## Question 1
What Node.js runtime target should the MVP require?

A) Node.js 20 LTS or newer

B) Node.js 22 LTS or newer

C) Any currently supported Node.js LTS version

X) Other (please describe after [Answer]: tag below)

[Answer]: c

## Question 2
Which package manager should project commands assume?

A) npm

B) pnpm

C) yarn

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
What is the acceptable render-performance target for MVP?

A) Correctness over speed; no hard render time SLA

B) A 3-minute video should render in under 10 minutes on a typical modern Mac

C) A 10-minute video should render in under 10 minutes on a typical modern Mac

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 4
How should integration tests that require Remotion rendering be treated?

A) Not blocking by default; document manual render verification

B) Blocking in normal test runs

C) Separate optional test command for render integration

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 5
How verbose should logs be by default?

A) Normal logs show major steps, cache hits, warnings, and final output

B) Verbose logs by default include every HTTP and file operation

C) Minimal logs by default, with verbose mode for details

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Approval

After answering all questions above, approve or request changes to this NFR requirements plan.

[Answer]: approve

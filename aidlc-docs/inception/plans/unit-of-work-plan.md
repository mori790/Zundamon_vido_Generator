# Unit of Work Plan

## Context

This plan decomposes the Zundamon Video Generator MVP into logical development units. The project is a greenfield local CLI and Remotion application, not a multi-service deployment. Units are therefore modules of work inside one application.

## Planning Checklist

- [x] Load approved requirements.
- [x] Load approved user stories.
- [x] Load approved application design.
- [x] Identify candidate unit boundaries from components and service flows.
- [x] Collect user answers for unit decomposition choices.
- [x] Analyze answers for ambiguity.
- [x] Obtain explicit approval of this unit of work plan.

## Generation Checklist

- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md` with unit definitions and responsibilities.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md` with dependency matrix.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md` mapping stories to units.
- [x] Document greenfield code organization strategy in `unit-of-work.md`.
- [x] Validate unit boundaries and dependencies.
- [x] Ensure all stories are assigned to units.
- [x] Update this plan's checkboxes immediately after each completed generation step.

## Recommended Decomposition

Use seven logical units:

1. Project Foundation and Shared Types
2. Script Validation, Assets, and Path Safety
3. VOICEVOX Audio Generation and Cache
4. Audio Measurement and Timeline Generation
5. Remotion Composition and Scene Rendering
6. CLI Orchestration and Render Integration
7. Tests, Sample Data, Placeholder Assets, and Documentation

## Questions

## Question 1
How should the MVP work be decomposed?

A) Use the recommended seven logical units

B) Use fewer coarse units: core generation, rendering, tests/docs

C) Use more granular units matching each component

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
How should implementation order be handled?

A) Sequential dependency order from shared types through tests/docs

B) Build a minimal vertical slice first, then fill in remaining features

C) Prioritize MVP A stories first, then B, then C

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
How should stories be assigned to units?

A) Assign each story to its primary owning unit, with secondary dependencies listed separately

B) Duplicate stories across every unit they touch

C) Assign stories only to user-visible units and omit foundation/test units from story mapping

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 4
Should all units be implemented inside one application package?

A) Yes - one package with `scripts/`, `src/`, `input/`, `public/`, `generated/`, and `output/`

B) No - split into multiple packages now

C) Keep one package but isolate modules as if they may become packages later

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 5
How should construction design stages apply to units?

A) Apply Functional Design, NFR Requirements, NFR Design, and Code Generation to the full unit set as one grouped MVP pass

B) Execute all construction design stages separately for each of the seven units

C) Apply detailed construction design only to algorithmic units, then code-generate the rest

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Approval

After answering all questions above, approve or request changes to this unit of work plan.

[Answer]: approve

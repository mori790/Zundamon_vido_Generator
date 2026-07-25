# Application Design Plan

## Context

This plan defines the high-level application design for Zundamon Video Generator. It focuses on component boundaries, interfaces, service orchestration, and dependencies. Detailed algorithms and business rules will be designed later in Functional Design.

## Planning Checklist

- [x] Load approved requirements.
- [x] Load approved user stories and persona.
- [x] Load approved workflow execution plan.
- [x] Identify key functional areas and component candidates.
- [x] Collect user answers for application design choices.
- [x] Analyze answers for ambiguity.
- [x] Obtain explicit approval of this application design plan.

## Design Generation Checklist

- [x] Generate `aidlc-docs/inception/application-design/components.md` with component definitions and high-level responsibilities.
- [x] Generate `aidlc-docs/inception/application-design/component-methods.md` with method signatures and high-level purposes.
- [x] Generate `aidlc-docs/inception/application-design/services.md` with service definitions and orchestration patterns.
- [x] Generate `aidlc-docs/inception/application-design/component-dependency.md` with dependency relationships and communication patterns.
- [x] Generate `aidlc-docs/inception/application-design/application-design.md` as consolidated design documentation.
- [x] Validate design completeness and consistency.
- [x] Update this plan's checkboxes immediately after each completed generation step.

## Candidate Components

- Script Loader and Validator
- Asset Checker and Path Resolver
- VOICEVOX Client
- Voice Generation and Cache Manager
- Audio Duration Reader
- Timeline Generator
- Render Data Builder
- Remotion Composition and Scene Components
- CLI Orchestrator
- Logger and Error Formatter
- Test Utilities

## Questions

## Question 1
How should the application code be organized?

A) Use the specification's structure with `scripts/` for CLI entry points and `src/` for shared app code and Remotion components

B) Put all TypeScript code under `src/`, including CLI entry points

C) Split into package-style folders such as `packages/core`, `packages/remotion`, and `packages/cli`

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 2
How should validation be implemented at the component boundary?

A) Use Zod schemas as the runtime source of truth, and infer TypeScript types from them where practical

B) Use TypeScript interfaces plus manual validation functions

C) Use JSON Schema files plus a validator such as Ajv

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
How should CLI orchestration call Remotion rendering?

A) Use Remotion's Node APIs from TypeScript scripts for controlled render orchestration

B) Spawn Remotion CLI commands from scripts

C) Only generate audio and timeline in custom scripts; let users run Remotion render manually

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 4
How should generated data be passed into the Remotion composition?

A) Load script, manifest, and timeline JSON from files at render time using input props

B) Generate a single combined render-data JSON and pass that to Remotion

C) Import input JSON directly from Remotion components

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 5
How should component dependencies be managed?

A) Keep dependency direction one-way: CLI orchestration depends on core modules, Remotion depends on render data/types, core does not depend on Remotion

B) Allow shared utilities to import from Remotion components when convenient

C) Keep Remotion and CLI completely isolated with duplicated types if needed

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Approval

After answering all questions above, approve or request changes to this application design plan.

[Answer]: approve

# Functional Design Plan: U3 JSON Draft Review and Scene Editing

## Unit Context

- **Unit**: U3 JSON Draft Review and Scene Editing.
- **Goal**: Let the creator review, edit, validate, discard, and explicitly apply `VideoScript` JSON drafts without accidentally overwriting `input/{videoId}.json`.
- **Primary Stories**: US-6, US-8, US-9.
- **Supporting Stories**: US-1, US-2, US-5, US-7, US-10, US-11, US-12, US-15, US-18.
- **Depends On**: U1 Electron App Shell and Workspace Foundation.
- **Related Completed Work**: U2 adds a mock Codex panel and chat history, but JSON proposal extraction is deferred to U4.
- **Out of Scope for U3**: Real Codex proposal parsing, asset file picker/copy, command runner, preview, voice generation, render.

## Step-by-Step Functional Design Plan

### Step 1: Draft Domain Model

- [x] Define draft lifecycle states.
- [x] Define active script versus draft script separation.
- [x] Define raw JSON text state and parsed structured state relationship.
- [x] Define validation error representation for draft review.

### Step 2: Draft Editing Business Logic

- [x] Define how a draft is created from an existing active script.
- [x] Define how a draft is created in an empty workspace.
- [x] Define raw JSON edit behavior.
- [x] Define structured scene edit behavior.
- [x] Define conversion behavior between raw and structured views.

### Step 3: Scene Editing Rules

- [x] Define add scene behavior.
- [x] Define remove scene behavior.
- [x] Define reorder behavior.
- [x] Define editable scene fields.
- [x] Define ID generation and duplicate handling.

### Step 4: Validation and Apply Rules

- [x] Define validation timing.
- [x] Define when Apply is enabled.
- [x] Define apply behavior to `input/{videoId}.json`.
- [x] Define discard behavior.
- [x] Define reload behavior after apply.

### Step 5: Frontend Component Design

- [x] Define JSON Review UI component hierarchy.
- [x] Define Raw JSON editor state and interactions.
- [x] Define Structured Scene editor state and interactions.
- [x] Define validation and apply controls.
- [x] Define workspace integration with the existing Studio shell.

### Step 6: Generate Functional Design Artifacts

- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/functional-design/business-logic-model.md`.
- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/functional-design/business-rules.md`.
- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/functional-design/domain-entities.md`.
- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/functional-design/frontend-components.md`.

## Clarification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag. Choose the last option if none of the listed choices match your intended workflow.

## Question 1
When opening an existing `input/{videoId}.json`, what should the editor show first?

A) Active script as read-only, with a separate button to create an editable draft

B) Active script copied into an editable draft immediately

C) Structured scene editor edits the active script in memory, but file saving still requires Apply

D) Other (please describe after the [Answer]: tag below)

[Answer]: a

## Question 2
For the first U3 implementation, how much structured scene editing should be supported?

A) Core fields only: scene type, text, emotion, character visible, before/after durations

B) Core fields plus visual config editing as plain structured fields

C) Core fields plus visual config and full speaker/video/subtitle settings

D) Other (please describe after the [Answer]: tag below)

[Answer]: a

## Question 3
How should raw JSON and structured scene view interact when raw JSON is invalid?

A) Keep the raw editor editable, show errors, and freeze the structured view at the last valid draft

B) Keep the raw editor editable, hide structured view until JSON becomes valid again

C) Automatically revert invalid raw edits to the last valid draft

D) Other (please describe after the [Answer]: tag below)

[Answer]: a

## Question 4
When applying a valid draft to `input/{videoId}.json`, should U3 create a backup file first?

A) No backup for this local MVP; Apply overwrites the canonical script

B) Create `input/{videoId}.json.bak` before overwrite

C) Create timestamped backups under `generated/studio/{videoId}/backups/`

D) Other (please describe after the [Answer]: tag below)

[Answer]: b

## Question 5
How should new scene IDs be generated in the editor?

A) Sequential IDs like `scene-001`, `scene-002`, renumbering only the new scene as needed

B) Sequential IDs and renumber all scenes after reorder/delete

C) Stable generated IDs like `scene-{timestamp}` to avoid changing existing references

D) Other (please describe after the [Answer]: tag below)

[Answer]: a

## Question 6
Should U3 include direct save/apply to `input/{videoId}.json`, or only local draft review until U4 approval flow exists?

A) Include direct Apply button in U3

B) Only draft review/edit in U3; saving waits for U4 approval flow

C) Include Apply only for manually edited drafts, not Codex-origin drafts

D) Other (please describe after the [Answer]: tag below)

[Answer]: a

## Content Validation

- No Mermaid diagrams are included.
- No ASCII diagrams are included.
- Markdown question format follows the required `[Answer]:` tag structure.

## Approval Gate

Functional design artifacts should be generated only after all questions are answered and validated.

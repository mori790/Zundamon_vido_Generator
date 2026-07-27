# U11 Components

## Scope

U11 implements internal adoption and planning support in the existing single npm package. It does not implement product runtime features for series management, template library, or multiple Workspace management.

## C1: Desktop-First README Component

- **Purpose**: Reframe README for internal non-developer Desktop adoption while preserving CLI and developer workflows.
- **Responsibilities**:
  - Present product purpose, supported Mac, `local-acceptance` meaning, and general distribution prohibition at the top.
  - Describe GUI First Run, Workspace selection, Codex, VOICEVOX, and sample-video smoke flow in order.
  - Provide ZIP and SHA-256 handoff and verification steps.
  - Separate GUI troubleshooting from CLI, development, test, and release commands.
  - Avoid normalizing Gatekeeper disablement, quarantine removal, arbitrary shell commands, or public-release claims.
- **Interfaces**:
  - Markdown content in `README.md`.
  - Links to internal acceptance and Post-MVP docs.
  - References to package scripts without reimplementing release-state logic.

## C2: Internal Acceptance Documentation Component

- **Purpose**: Provide repeatable clean-profile smoke execution and evidence capture for internal acceptance.
- **Responsibilities**:
  - Store checklist and evidence template under `docs/internal-acceptance/`.
  - Define the minimum smoke as ZIP verification, app launch, empty Workspace selection, sample-video load, Render path, and non-zero MP4 confirmation.
  - Keep Codex, VOICEVOX diagnosis, editing, assets, Stop, Finder reveal, update, and Rollback as additional checks.
  - Mark clean-profile acceptance as Not Run until performed on an appropriate Mac or macOS user profile.
  - Warn against recording credentials, tokens, personal information, and unnecessary absolute paths.
- **Interfaces**:
  - `docs/internal-acceptance/clean-profile-smoke-checklist.md`.
  - `docs/internal-acceptance/acceptance-evidence-template.md`.
  - README links and release handoff instructions.

## C3: Acceptance Preflight Component

- **Purpose**: Add one non-destructive local command for internal release acceptance readiness.
- **Responsibilities**:
  - Reuse existing release artifact verifier contracts instead of duplicating manifest or release-state logic.
  - Verify arm64 ZIP, release manifest, SBOM, ZIP SHA-256 match, architecture, and `local-acceptance` state.
  - Execute or verify production dependency audit, typecheck, default tests, and Studio build.
  - Fail closed with a non-zero exit code and Japanese action guidance.
  - Report evidence paths without modifying existing Workspace, input, asset, or output data.
- **Interfaces**:
  - New npm script, proposed as `acceptance:preflight`.
  - Thin TypeScript script wrapper under `scripts/`.
  - Existing release manifest and release verification outputs.
  - Existing npm scripts for audit, typecheck, tests, and Studio build.

## C4: Release Evidence Adapter

- **Purpose**: Encapsulate U11's read-only interaction with existing release evidence.
- **Responsibilities**:
  - Locate generated release manifest, SBOM, ZIP, and checksum evidence.
  - Parse bounded manifest data using existing schema or shared validation helpers where available.
  - Classify artifact state without ever converting unsigned `local-acceptance` into `publishable`.
  - Return typed evidence summaries for preflight reporting and tests.
- **Interfaces**:
  - Existing `src/studio/shared/release.ts` contracts.
  - Existing `scripts/release-artifacts.ts` behavior and outputs.
  - File-system read access to release artifact directories only.

## C5: Post-MVP Planning Component

- **Purpose**: Preserve the future feature backlog and design the top three Next features at planning depth.
- **Responsibilities**:
  - Store backlog and roadmap under `docs/post-mvp/`.
  - Document Next, Later, and Future classification without date or effort commitments.
  - Detail series management, template library, and multiple Workspace management by component, method, service, dependency, NFR, and acceptance criteria.
  - Explicitly keep Future items that weaken Human Approval or local-only boundaries out of current implementation.
  - Connect future pure data logic to Partial PBT expectations.
- **Interfaces**:
  - `docs/post-mvp/backlog.md`.
  - `docs/post-mvp/roadmap.md`.
  - `docs/post-mvp/series-management-spec.md`.
  - `docs/post-mvp/template-library-spec.md`.
  - `docs/post-mvp/multiple-workspaces-spec.md`.

## C6: Future Series Management Specification Component

- **Purpose**: Define the future series model and UI/service responsibilities without implementing them in U11.
- **Responsibilities**:
  - Specify versioned Series metadata with ordered unique video IDs.
  - Preserve existing `input/{videoId}.json` files by reference only.
  - Define invalid-data rejection and atomic save expectations.
  - Keep series deletion non-destructive for scripts, assets, audio, and outputs.
- **Interfaces**:
  - Future typed IPC and Main service, not implemented in U11.
  - Future Workspace JSON storage.

## C7: Future Template Library Specification Component

- **Purpose**: Define future template reuse behavior without implementing it in U11.
- **Responsibilities**:
  - Specify read-only built-in templates and user-managed Workspace templates.
  - Require template application to create drafts, never direct active-script overwrites.
  - Validate placeholders, schema versions, unknown fields, and generated `VideoScript`.
  - Keep asset binaries outside templates.
- **Interfaces**:
  - Future template parser and draft generation service, not implemented in U11.
  - Existing U3 draft apply boundary.

## C8: Future Multiple Workspace Specification Component

- **Purpose**: Define future recent-Workspace switching behavior without implementing it in U11.
- **Responsibilities**:
  - Specify versioned `userData` reference list with canonical path uniqueness.
  - Keep exactly one active Workspace.
  - Require Main-process canonical validation and purpose-specific Renderer APIs.
  - Require explicit confirmation when unsaved draft, running command, or active Codex turn exists.
  - Keep Workspace reference deletion non-destructive.
- **Interfaces**:
  - Future Workspace reference service, not implemented in U11.
  - Existing `WorkspaceRootService` and Workspace API concepts.

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Components preserve checksum verification, no public-release claim for unsigned artifacts, secret-safe evidence, schema validation, and purpose-specific IPC boundaries. |
| Resiliency Baseline | Compliant | Components preserve local Backup & Restore, direct/in-place deployment, fail-closed release verification, rollback note, and incident evidence. |
| Property-Based Testing (Partial) | Compliant | Future data components identify round-trip, invariant, generator quality, seed replay, and fast-check framework expectations. |

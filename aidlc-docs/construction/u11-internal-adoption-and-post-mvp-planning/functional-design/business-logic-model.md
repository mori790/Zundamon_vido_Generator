# U11 Business Logic Model

## Unit Boundary

U11 implements internal adoption support and Post-MVP planning artifacts. It adds no runtime product behavior for series management, template library, or multiple Workspace management.

## Functional Areas

### F1: Desktop Adoption Content Flow

**Goal**: Route non-developer internal users from README opening to minimum smoke completion.

**Inputs**:

- Supported platform constraints.
- Current `local-acceptance` release status.
- Existing GUI, CLI, dependency, and release command behavior.
- Links to internal acceptance and Post-MVP docs.

**Outputs**:

- Desktop-first README sections.
- Clear separation between user path and developer/CLI appendix.
- Safe troubleshooting and release-state language.

**State Transitions**:

| State | Trigger | Next State |
|---|---|---|
| Reader starts at README | Opens project docs | Understands product and local-acceptance scope |
| User has ZIP and SHA-256 | Follows checksum instructions | Artifact verified or rejected |
| User starts app | Follows First Run | Workspace ready or blocked with action |
| User reaches smoke | Runs sample-video render | Pass, Fail, or Blocked evidence |

### F2: Acceptance Evidence Flow

**Goal**: Capture acceptance status without credentials, personal data, or misleading pass claims.

**Inputs**:

- Execution date, runner, Mac model, CPU, macOS version.
- App version, Git revision, ZIP name, SHA-256.
- Step-level result: Pass, Fail, Blocked, or Not Run.
- Sanitized evidence path or short evidence description.

**Outputs**:

- Markdown evidence record.
- Failure summary, workaround, and retest result.
- Explicit Not Run state for clean-profile smoke until real execution.

**State Transitions**:

| State | Trigger | Next State |
|---|---|---|
| Not Run | Step executed successfully | Pass |
| Not Run | Required condition unavailable | Blocked |
| Not Run | Step executed and failed | Fail |
| Fail | Workaround applied and retested | Pass or Fail |
| Blocked | Required condition becomes available | Not Run or Pass |

### F3: Acceptance Preflight Flow

**Goal**: Verify local acceptance readiness through one strict, non-destructive command.

**Inputs**:

- Repository root.
- Release artifact directory or default artifact location.
- Existing release manifest, SBOM, ZIP, and checksum evidence.
- Production audit, typecheck, default test, and Studio build commands.

**Outputs**:

- Structured preflight result.
- Japanese report with pass/fail status, action guidance, and evidence paths.
- Process exit code.

**Processing Model**:

1. Resolve artifact references.
2. If any required artifact is missing, return failure and action to generate local-acceptance artifacts first.
3. Load and validate manifest using existing release evidence semantics where available.
4. Verify ZIP SHA-256 against manifest.
5. Verify architecture is arm64.
6. Verify release state is exactly `local-acceptance`, and do not describe it as `publishable`.
7. Run or verify production dependency audit, typecheck, default tests, and Studio build.
8. Return success only if every required check passes.

**State Transitions**:

| State | Trigger | Next State |
|---|---|---|
| Pending | Required artifact missing | Failed |
| Pending | Artifact evidence invalid | Failed |
| Pending | Build/test gate fails | Failed |
| Pending | All required checks pass | Passed |
| Failed | User follows action and reruns | Pending |

### F4: Post-MVP Planning Flow

**Goal**: Preserve future planning decisions without implementing future features.

**Inputs**:

- Approved U11 requirements and stories.
- Backlog candidates.
- Next/Later/Future classification.
- Top-three feature requirements.

**Outputs**:

- `docs/post-mvp/backlog.md`.
- `docs/post-mvp/roadmap.md`.
- `docs/post-mvp/series-management-spec.md`.
- `docs/post-mvp/template-library-spec.md`.
- `docs/post-mvp/multiple-workspaces-spec.md`.

**Processing Model**:

1. Normalize backlog candidates without duplicates.
2. Assign each candidate to Next, Later, or Future.
3. Document value, dependency, risk, rough size, and exit criteria.
4. Detail top-three specs by user journey, data, validation, UI, service, dependency, NFR, acceptance criteria, and PBT properties.
5. Mark Future items requiring Human Approval or cloud/security/resiliency re-evaluation.

## Testable Properties

| Property | Entity | Category | Generator Constraints | Seed Replay |
|---|---|---|---|---|
| `manifestChecksumMatchesZip` | Release artifact evidence | Invariant | Existing ZIP path, SHA-256 hex string, manifest record | fast-check seed printed on failure if implemented as pure helper |
| `releaseStateNeverEscalates` | Release state summary | Invariant | State enum with signing/notarization combinations | Fixed or logged fast-check seed |
| `evidencePathIsSanitized` | Evidence path field | Invariant | Relative paths and redacted absolute-path samples | Fixed or logged fast-check seed |
| `seriesRoundTripPreservesOrder` | Future Series metadata | Round-trip | 0 to 100 unique video IDs, valid IDs, status enum | Future implementation must log seed |
| `seriesVideoIdsRemainUnique` | Future Series metadata | Invariant | Lists with duplicates and missing IDs | Future implementation must log seed |
| `templateRoundTripPreservesMeaning` | Future Template metadata | Round-trip | Valid placeholders, skeletons, schema versions | Future implementation must log seed |
| `templateDraftIsSchemaValid` | Future generated draft | Invariant | Placeholder maps satisfying template schema | Future implementation must log seed |
| `workspaceReferencesAreCanonicalUnique` | Future Workspace reference list | Invariant | Duplicate and distinct canonical paths, display names, timestamps | Future implementation must log seed |

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Logic preserves artifact integrity, secret-safe evidence, fail-closed release state, and bounded future schema validation. |
| Resiliency Baseline | Compliant | Logic preserves Not Run/Blocked/Fail distinction, rerunnable preflight, rollback evidence, and local direct/in-place acceptance. |
| Property-Based Testing (Partial) | Compliant | PBT-02, PBT-03, PBT-07, PBT-08, and PBT-09 properties are identified for current pure helpers and future specs. |

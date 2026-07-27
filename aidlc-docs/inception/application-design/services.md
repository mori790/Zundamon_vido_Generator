# U11 Services

## S1: Internal Adoption Documentation Service

- **Purpose**: Coordinate README and internal acceptance documentation updates.
- **Owned Components**: C1 Desktop-First README Component, C2 Internal Acceptance Documentation Component.
- **Responsibilities**:
  - Produce a Desktop-first README structure.
  - Link checklist and evidence template from README.
  - Keep CLI, development, test, and release instructions available but secondary.
  - Keep unsafe or public-release wording out of internal acceptance instructions.
- **Interactions**:
  - Reads U11 requirements and stories.
  - References existing release docs and package commands.
  - Produces Markdown under root README and `docs/internal-acceptance/`.

## S2: Acceptance Preflight Service

- **Purpose**: Orchestrate local acceptance readiness checks through one npm command.
- **Owned Components**: C3 Acceptance Preflight Component, C4 Release Evidence Adapter.
- **Responsibilities**:
  - Resolve release artifact evidence.
  - Confirm ZIP, manifest, SBOM, checksum, architecture, and release state.
  - Run or confirm production audit, typecheck, default tests, and Studio build.
  - Produce a Japanese report with failure actions and evidence paths.
  - Exit non-zero on any required failure.
- **Interactions**:
  - Calls existing release verifier logic and npm scripts.
  - Reads release outputs.
  - Does not write to Workspace, input, asset, or output data.

## S3: Post-MVP Planning Service

- **Purpose**: Convert requirements and stories into normal project docs for future planning.
- **Owned Components**: C5 Post-MVP Planning Component, C6 Series Spec, C7 Template Spec, C8 Multiple Workspace Spec.
- **Responsibilities**:
  - Generate backlog and roadmap under `docs/post-mvp/`.
  - Generate top-three design specifications.
  - Keep Future items constrained by Human Approval, local-only posture, and security/resiliency re-evaluation.
  - Identify future PBT properties without adding implementation tests in U11.
- **Interactions**:
  - Reads U11 requirements and stories.
  - References existing Workspace, VideoScript, draft, command, Codex, and release boundaries.
  - Produces planning Markdown only.

## S4: Release Boundary Reuse Service

- **Purpose**: Ensure U11 acceptance logic stays aligned with existing release evidence semantics.
- **Owned Components**: C4 Release Evidence Adapter.
- **Responsibilities**:
  - Reuse release-state and manifest contracts instead of independent redefinition.
  - Keep `local-acceptance` and `publishable` classification mutually distinct.
  - Surface missing signing/notarization as a failure for public release and as an explicit local-acceptance limitation.
- **Interactions**:
  - Depends on existing release contracts in `src/studio/shared/release.ts`.
  - Depends on outputs produced by `scripts/release-artifacts.ts`.
  - Feeds S2 preflight results and S1 README wording.

## S5: Design Governance Service

- **Purpose**: Preserve U11 scope boundaries and extension constraints across downstream stages.
- **Owned Components**: All U11 components.
- **Responsibilities**:
  - Prevent implementation of future product features during U11.
  - Carry Security, Resiliency, and Partial PBT constraints into Functional Design, NFR stages, and Code Generation.
  - Preserve auditability through AI-DLC artifacts and state updates.
  - Ensure no stage marks clean-profile smoke as passed without an actual execution record.
- **Interactions**:
  - Reads `aidlc-docs/aidlc-state.md`, U11 requirements, user stories, and generated design artifacts.
  - Updates downstream plan and summary artifacts.

## Service Orchestration

1. S5 confirms U11 scope and extension constraints.
2. S1 updates user-facing and acceptance documentation.
3. S4 exposes release evidence semantics to S2 and documentation.
4. S2 validates local acceptance readiness through one command.
5. S3 publishes Post-MVP backlog, roadmap, and top-three specifications.
6. Build and Test verifies docs, preflight behavior, and release-state safety.

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Services route release integrity, safe reporting, and validation through existing boundaries. Cloud and authentication controls are N/A. |
| Resiliency Baseline | Compliant | Services preserve local rollback, direct/in-place deployment, failure containment, and incident evidence capture. Cloud HA controls are N/A. |
| Property-Based Testing (Partial) | Compliant | Services identify where future serializers and validators require PBT; current U11 code will use PBT only for new pure logic if introduced. |

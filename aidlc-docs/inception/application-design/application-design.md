# U11 Application Design

## Design Decision Summary

The approved Application Design choices are:

- Add only a thin internal acceptance preflight wrapper and reuse existing release artifact verifier semantics.
- Place internal acceptance checklist and evidence template under `docs/internal-acceptance/`.
- Place Post-MVP backlog, roadmap, and top-three feature specifications under `docs/post-mvp/`.
- Include artifact validation plus production audit, typecheck, default tests, and Studio build in preflight handling.
- Include component, method, service, and dependency design for the Next top-three future features as specification only.

## Current Implementation Boundary

U11 implementation includes:

- README restructuring for Desktop-first internal adoption.
- Internal acceptance checklist and evidence template.
- One local acceptance preflight command.
- Post-MVP backlog, roadmap, and top-three specification documents.
- Focused tests for new preflight behavior and any new pure validation logic.

U11 implementation excludes:

- Series management runtime UI or persistence.
- Template library runtime UI or persistence.
- Multiple Workspace runtime UI or persistence.
- Auto update, installer changes, cloud sync, YouTube integration, or complete Codex automation.

## Component Summary

| Component | Current U11 Status | Purpose |
|---|---|---|
| Desktop-First README | Implement | Non-developer Desktop adoption path. |
| Internal Acceptance Documentation | Implement | Checklist and evidence capture. |
| Acceptance Preflight | Implement | Non-destructive local readiness verification. |
| Release Evidence Adapter | Implement or reuse | Safe read-only release evidence access. |
| Post-MVP Planning | Implement as docs | Backlog, roadmap, and top-three specs. |
| Future Series Spec | Specification only | Define future series behavior. |
| Future Template Spec | Specification only | Define future template behavior. |
| Future Multiple Workspace Spec | Specification only | Define future Workspace switching behavior. |

## Service Summary

| Service | Responsibility | Primary Outputs |
|---|---|---|
| Internal Adoption Documentation Service | README, checklist, evidence template coordination | `README.md`, `docs/internal-acceptance/` |
| Acceptance Preflight Service | Artifact, release-state, build/test readiness checks | npm command, Japanese report, exit code |
| Post-MVP Planning Service | Future backlog and top-three specs | `docs/post-mvp/` |
| Release Boundary Reuse Service | Existing release-state and manifest semantics | Sanitized evidence summary |
| Design Governance Service | Scope and extension compliance preservation | Downstream design and code-generation constraints |

## Key Dependencies

- Existing release contracts in `src/studio/shared/release.ts`.
- Existing release artifact behavior in `scripts/release-artifacts.ts`.
- Existing npm scripts for audit, typecheck, tests, Studio build, packaging, and release verification.
- Existing Workspace, local-file, command, Codex approval, and VideoScript boundaries for future feature specifications.

## Design Constraints

- Preflight must be non-destructive.
- Preflight must return non-zero for missing artifact, checksum mismatch, wrong architecture, wrong release state, or build/test gate failure.
- Unsigned `local-acceptance` must never be described as `publishable`.
- README must avoid Gatekeeper disablement and quarantine removal as normal instructions.
- Evidence templates must avoid credentials, tokens, personal data, and unnecessary absolute paths.
- Future feature specs must preserve context isolation, purpose-specific IPC, schema validation, atomic writes, and fail-closed recovery.
- Clean-profile acceptance must remain Not Run until actually performed in a compatible environment.

## Downstream Carry-Forward

### Functional Design

Functional Design must detail:

- Preflight result model and status transitions.
- Artifact discovery and release evidence validation rules.
- Japanese report wording and failure action mapping.
- Checklist and evidence template field semantics.
- Post-MVP backlog and spec document structure.

### NFR Requirements

NFR Requirements must preserve:

- Security: checksum, SBOM, no secret/PII reporting, fail-closed release state, bounded parsing.
- Resiliency: Low criticality, RTO hours, RPO manual backup, direct/in-place deployment, rollback note, incident record.
- Partial PBT: round-trip and invariant testing for new pure parser/serializer/normalizer logic.

### Code Generation

Code Generation must implement only:

- Documentation files and README links.
- Thin preflight command and npm script.
- Focused example tests and PBT only where new pure logic exists.

## Artifact References

- `aidlc-docs/inception/application-design/components.md`
- `aidlc-docs/inception/application-design/component-methods.md`
- `aidlc-docs/inception/application-design/services.md`
- `aidlc-docs/inception/application-design/component-dependency.md`

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | The design enforces artifact integrity, bounded validation, safe evidence, release-state separation, and Main-mediated future filesystem access. Cloud, network, and authentication rules are N/A for U11. |
| Resiliency Baseline | Compliant | The design captures Low criticality, local Backup & Restore, direct/in-place deployment, rollback notes, incident evidence, and fail-closed preflight. Cloud HA and centralized observability rules are N/A. |
| Property-Based Testing (Partial) | Compliant | The design carries PBT-02, PBT-03, PBT-07, PBT-08, and PBT-09 forward for new pure data logic. Other PBT rules remain advisory in Partial mode. |

## Completeness Check

- Components defined: Yes.
- Component methods defined: Yes.
- Services defined: Yes.
- Dependencies and communication patterns defined: Yes.
- U11 implementation boundary defined: Yes.
- Future specification boundary defined: Yes.
- Extension findings: No blocking findings.

# U11 Component Dependencies

## Dependency Matrix

| Component | Depends On | Used By | Communication Pattern |
|---|---|---|---|
| C1 Desktop-First README | U11 requirements, release state terminology, internal acceptance docs | P1, P2, S1 | Markdown links and command references |
| C2 Internal Acceptance Documentation | U11 smoke criteria, evidence fields, security warnings | P1, P2, S1 | Markdown checklist and template |
| C3 Acceptance Preflight | C4 release evidence adapter, existing npm scripts | P2, S2 | CLI orchestration and process exit code |
| C4 Release Evidence Adapter | Existing release contracts and artifact outputs | C1, C3, S2, S4 | Read-only typed evidence summary |
| C5 Post-MVP Planning | U11 backlog requirements, stories, future constraints | P2, P3, S3 | Markdown planning documents |
| C6 Future Series Spec | Existing Workspace and script concepts | C5, future implementation unit | Specification only |
| C7 Future Template Spec | Existing VideoScript schema and U3 draft apply boundary | C5, future implementation unit | Specification only |
| C8 Future Multiple Workspace Spec | Existing WorkspaceRootService and Workspace API concepts | C5, future implementation unit | Specification only |

## Data Flow

### Internal Adoption Flow

1. U11 requirements and stories define non-developer acceptance needs.
2. C1 creates the README entry path.
3. C2 creates checklist and evidence template.
4. C4 provides release-state vocabulary and evidence references.
5. Users follow README links to checklist and record results in the evidence template.

### Preflight Flow

1. P2 runs the npm preflight command.
2. C3 resolves repository and artifact locations.
3. C4 reads manifest, ZIP, SBOM, checksum, architecture, and release-state evidence.
4. C3 runs or verifies production audit, typecheck, default tests, and Studio build.
5. C3 reports Japanese pass/fail results and returns an exit code.
6. Existing Workspace, input, asset, and output directories remain untouched.

### Post-MVP Planning Flow

1. C5 reads the U11 approved backlog and stories.
2. C5 writes roadmap and backlog docs under `docs/post-mvp/`.
3. C6, C7, and C8 contribute top-three feature specifications.
4. Future implementation units can consume those specs after separate approval.

## Coupling Rules

- README must link to docs and command names; it must not duplicate release-state algorithms.
- Preflight must reuse existing release evidence contracts where practical.
- Preflight must not depend on Renderer or Electron window state.
- Future specs may reference existing runtime concepts but must not require U11 runtime code changes.
- Any future Renderer access to series, template, or Workspace data must remain purpose-specific and Main-mediated.
- Clean-profile smoke result must remain Not Run until a real compatible environment executes it.

## Change Impact

| Area | Current U11 Impact | Future Impact |
|---|---|---|
| Electron Main | No direct runtime change expected, unless preflight reuses shared release code only | Future series/template/workspace IPC design |
| Renderer | No direct U11 runtime change | Future Start screen and library flows |
| CLI scripts | Add thin acceptance preflight command | Possible future migration tooling |
| Shared contracts | Prefer reuse; add only if preflight needs typed shared result | Future schemas for series, templates, workspace refs |
| Docs | Major U11 change | Ongoing source for future implementation units |
| Tests | Focused preflight and documentation checks | Future PBT for data models |

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Dependencies keep filesystem authority out of Renderer, preserve artifact integrity checks, and avoid secret-bearing evidence. |
| Resiliency Baseline | Compliant | Dependencies keep preflight fail-closed and non-destructive, with explicit rollback and incident evidence paths. |
| Property-Based Testing (Partial) | Compliant | Dependencies identify future round-trip and invariant surfaces while limiting U11 enforcement to new pure logic. |

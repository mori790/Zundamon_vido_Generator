# U11 Business Rules

## Preflight Rules

| Rule ID | Rule | Failure Behavior |
|---|---|---|
| U11-BR-1 | Preflight success requires all gates to pass: artifact presence, checksum, architecture, release state, production audit, typecheck, default tests, and Studio build. | Exit non-zero and print Japanese action guidance. |
| U11-BR-2 | Missing ZIP, manifest, or SBOM must not trigger automatic artifact generation. | Exit non-zero and instruct the user to generate local-acceptance artifacts first. |
| U11-BR-3 | Release state must be exactly `local-acceptance` for internal acceptance preflight. | Reject `publishable`, unknown, missing, or inconsistent state. |
| U11-BR-4 | Unsigned or unnotarized artifacts must never be described as public-release ready. | Report local-acceptance limitation explicitly. |
| U11-BR-5 | ZIP SHA-256 must match manifest evidence exactly. | Reject mismatch and instruct user not to distribute the ZIP. |
| U11-BR-6 | Architecture must be arm64 for U11 internal acceptance. | Reject non-arm64 artifact. |
| U11-BR-7 | Preflight must not modify Workspace, `input/`, `assets/`, `audio/`, or `output/`. | Treat any required mutation as design violation. |
| U11-BR-8 | Preflight output must include evidence paths and next actions without printing credentials, tokens, or personal data. | Redact or omit unsafe values. |

## README and Internal Acceptance Rules

| Rule ID | Rule | Failure Behavior |
|---|---|---|
| U11-BR-9 | README must start with Desktop-first internal user guidance before CLI/developer details. | Documentation review fails. |
| U11-BR-10 | README must preserve existing CLI and developer commands in a separate later section. | Documentation review fails. |
| U11-BR-11 | README and checklist must explain `local-acceptance` and general distribution prohibition. | Security finding. |
| U11-BR-12 | Gatekeeper disablement and quarantine removal must not appear as normal installation steps. | Security finding. |
| U11-BR-13 | Minimum smoke is limited to ZIP verification, app launch, empty Workspace selection, sample-video load, Render path, and non-zero MP4 confirmation. | Checklist review fails. |
| U11-BR-14 | Codex, VOICEVOX diagnosis, editing, asset, Stop, Finder reveal, update, and Rollback checks are additional checks and do not block minimum smoke completion. | Checklist review fails. |
| U11-BR-15 | VOICEVOX available path is the standard Render path; VOICEVOX unavailable path must be separated as developer-assisted existing-audio or skip-voice-equivalent support. | Checklist review fails. |
| U11-BR-16 | Clean-profile smoke must remain Not Run until actually executed in a compatible environment. | Evidence review fails. |

## Evidence Rules

| Rule ID | Rule | Failure Behavior |
|---|---|---|
| U11-BR-17 | Evidence status values are Pass, Fail, Blocked, and Not Run. | Invalid status is rejected in docs/tests. |
| U11-BR-18 | Evidence paths should be relative paths or short descriptions. Redacted absolute paths are allowed only when necessary. | Template guidance must request redaction. |
| U11-BR-19 | Evidence must capture date/time, runner, Mac model, CPU architecture, macOS version, app version, Git revision, ZIP name, and SHA-256. | Template incomplete. |
| U11-BR-20 | Failure evidence must capture failure summary, workaround, and retest result. | Template incomplete. |
| U11-BR-21 | Evidence must warn against credentials, tokens, personal information, and unnecessary absolute paths. | Security finding. |

## Post-MVP Planning Rules

| Rule ID | Rule | Failure Behavior |
|---|---|---|
| U11-BR-22 | Post-MVP candidates must be listed without duplicates and assigned to Next, Later, or Future. | Planning doc review fails. |
| U11-BR-23 | Roadmap must avoid date and effort commitments. | Planning doc review fails. |
| U11-BR-24 | Moving a roadmap item requires re-evaluation of value, dependency, risk, and approval. | Planning doc review fails. |
| U11-BR-25 | Series management, template library, and multiple Workspace management are specification-only in U11. | Scope violation if product code implements them. |
| U11-BR-26 | Complete Codex automation and Cloud sharing remain Future because they affect Human Approval, local-only posture, Security, and Resiliency boundaries. | Planning doc review fails. |
| U11-BR-27 | Top-three specs must include property name, entity, generator constraints, and seed replay expectations for future PBT. | PBT compliance finding. |

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Rules cover artifact integrity, safe instructions, redaction, no unsafe release claims, and future schema validation. |
| Resiliency Baseline | Compliant | Rules cover fail-closed behavior, rerun actions, Not Run/Blocked states, rollback evidence, and local recovery posture. |
| Property-Based Testing (Partial) | Compliant | Rules carry PBT-02, PBT-03, PBT-07, PBT-08, and PBT-09 into future specs and current pure helpers. |

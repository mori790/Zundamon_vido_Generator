# U11 Component Methods

## C1: Desktop-First README Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `renderDesktopIntroduction` | Product purpose, supported Mac, release state | README section | Places non-developer Desktop entry information before CLI details. |
| `renderInternalDistributionWarning` | Release state, signing status | README warning block | Explains `local-acceptance` and blocks public-release interpretation. |
| `renderFirstRunGuide` | Workspace, Codex, VOICEVOX, sample-video flow | README section | Defines the ordered user path from launch to smoke render. |
| `renderTroubleshootingIndex` | Known recovery actions | README section | Routes users to safe recovery without destructive or secret-revealing commands. |
| `renderDeveloperAppendix` | Existing CLI, test, release commands | README appendix | Preserves existing developer and CLI workflows after GUI sections. |

## C2: Internal Acceptance Documentation Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `writeCleanProfileSmokeChecklist` | Minimum smoke requirements, additional checks | Checklist Markdown | Creates the internal acceptance runbook. |
| `writeAcceptanceEvidenceTemplate` | Required evidence fields, safety warnings | Evidence template Markdown | Creates a reusable result record template. |
| `markAcceptanceStatus` | Actual execution status | Checklist status text | Keeps unexecuted clean-profile acceptance marked as Not Run. |
| `linkAcceptanceDocsFromReadme` | Docs paths | README links | Makes checklist and evidence template discoverable. |

## C3: Acceptance Preflight Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `runAcceptancePreflight` | CLI options, repository root | Preflight result | Orchestrates artifact checks and local build/test gates. |
| `verifyRequiredArtifacts` | Artifact directory | Artifact presence result | Checks arm64 ZIP, release manifest, and SBOM presence. |
| `verifyManifestChecksum` | Manifest, ZIP path | Checksum result | Confirms ZIP SHA-256 matches manifest evidence. |
| `verifyLocalAcceptanceState` | Release evidence | Release-state result | Requires `local-acceptance` and rejects `publishable` claims for unsigned artifacts. |
| `runVerificationGate` | Command list | Gate result | Runs or confirms production audit, typecheck, default tests, and Studio build. |
| `formatPreflightReportJa` | Preflight result | Japanese report text | Provides pass/fail, action guidance, and evidence paths. |
| `exitForPreflightResult` | Preflight result | Process exit code | Returns 0 only when all required checks pass. |

## C4: Release Evidence Adapter

| Method | Input | Output | Purpose |
|---|---|---|---|
| `loadReleaseManifest` | Manifest path | Parsed manifest | Reads bounded release metadata through existing validation. |
| `loadSbomEvidence` | SBOM path | SBOM presence metadata | Confirms SBOM availability without parsing unnecessary sensitive data. |
| `resolveReleaseArtifacts` | Repository root, optional artifact path | Artifact references | Locates ZIP, manifest, SBOM, and evidence paths. |
| `classifyReleaseEvidence` | Parsed manifest, signing evidence | Release state | Reuses existing classification semantics. |
| `summarizeEvidenceForReport` | Release evidence | Sanitized summary | Removes secrets and unnecessary absolute paths from user-facing output. |

## C5: Post-MVP Planning Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `writePostMvpBacklog` | Candidate list, value, risk, dependency, size | Backlog Markdown | Documents all future candidates without duplicates. |
| `writeRoadmap` | Next, Later, Future groups | Roadmap Markdown | Captures priority bands without date commitments. |
| `writeTopThreeSpecs` | Series, template, workspace requirements | Spec documents | Produces implementation-decision-ready specs for the top three features. |
| `recordFutureBoundary` | Future candidate risks | Spec section | Keeps Human Approval and local-only risk visible. |

## C6: Future Series Management Specification Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `defineSeriesMetadataSchema` | Series requirements | Schema specification | Defines versioned Series metadata fields. |
| `validateSeriesReferences` | Series metadata, existing video IDs | Validation result | Rejects missing and duplicate video IDs. |
| `saveSeriesAtomically` | Valid Series metadata | Save contract | Specifies atomic persistence and invalid-data preservation. |
| `deleteSeriesReferenceOnly` | Series ID | Deletion contract | Specifies non-destructive series deletion. |

## C7: Future Template Library Specification Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `defineTemplateSchema` | Template requirements | Schema specification | Defines template ID, schema version, skeleton, and placeholders. |
| `validateTemplateInput` | Template, placeholder values | Validation result | Rejects missing placeholders, type mismatch, unknown fields, and unsupported versions. |
| `createDraftFromTemplate` | Template, placeholder values | Draft contract | Specifies draft creation without active-script overwrite. |
| `validateGeneratedDraft` | Draft JSON | VideoScript validation result | Requires existing VideoScript schema compatibility. |

## C8: Future Multiple Workspace Specification Component

| Method | Input | Output | Purpose |
|---|---|---|---|
| `defineWorkspaceReferenceSchema` | Workspace reference requirements | Schema specification | Defines canonical path, display name, and last-used fields. |
| `normalizeWorkspaceReferences` | Reference list | Deduplicated list | Requires canonical path uniqueness. |
| `validateWorkspaceReferenceInMain` | Candidate path | Validation result | Keeps filesystem authority in Main. |
| `confirmWorkspaceSwitch` | Unsaved draft, running command, Codex turn state | Confirmation contract | Prevents silent context loss. |
| `removeWorkspaceReferenceOnly` | Workspace reference | Deletion contract | Specifies non-destructive removal from recent list. |

## Notes

- Method names describe design contracts and are not final implementation names.
- Detailed business rules move to Functional Design.
- U11 implementation methods apply only to C1 through C5; C6 through C8 are future specifications.

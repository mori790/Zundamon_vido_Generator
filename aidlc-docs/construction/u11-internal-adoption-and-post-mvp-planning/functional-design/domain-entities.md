# U11 Domain Entities

## Current U11 Entities

### InternalAcceptanceArtifact

| Field | Type | Constraints |
|---|---|---|
| `zipPath` | Path reference | Required, points to arm64 ZIP. |
| `manifestPath` | Path reference | Required, bounded parsed metadata. |
| `sbomPath` | Path reference | Required, existence verified. |
| `sha256` | String | Required, lowercase or uppercase SHA-256 hex accepted and normalized for compare. |
| `architecture` | String | Must be `arm64`. |
| `releaseState` | String | Must be `local-acceptance` for U11 preflight. |

### PreflightCheck

| Field | Type | Constraints |
|---|---|---|
| `id` | String | Stable check ID. |
| `labelJa` | String | User-facing Japanese check name. |
| `status` | Enum | `pass`, `fail`, `blocked`, or `not-run`. |
| `evidencePath` | String optional | Relative or redacted path preferred. |
| `actionJa` | String optional | Required on fail or blocked. |

### PreflightResult

| Field | Type | Constraints |
|---|---|---|
| `status` | Enum | `passed` only when all required checks pass; otherwise `failed`. |
| `checks` | PreflightCheck array | Must include artifact, checksum, architecture, release state, audit, typecheck, tests, and Studio build. |
| `summaryJa` | String | Must not claim publishability for local acceptance. |
| `exitCode` | Number | 0 for passed, non-zero for failed. |

### AcceptanceEvidenceRecord

| Field | Type | Constraints |
|---|---|---|
| `executedAt` | Date/time text | Required when run. |
| `runner` | String | Non-sensitive name or role. |
| `macModel` | String | Required for executed smoke. |
| `cpuArchitecture` | String | Must record observed architecture. |
| `macosVersion` | String | Required for executed smoke. |
| `appVersion` | String | Required when available. |
| `gitRevision` | String | Required when available. |
| `zipName` | String | Required for ZIP-based acceptance. |
| `sha256` | String | Required for ZIP-based acceptance. |
| `steps` | EvidenceStep array | Pass, Fail, Blocked, or Not Run. |
| `failureSummary` | String optional | Required when any step fails. |
| `workaround` | String optional | Required when workaround used. |
| `retestResult` | String optional | Required when retested. |

### EvidenceStep

| Field | Type | Constraints |
|---|---|---|
| `name` | String | Stable checklist step name. |
| `status` | Enum | Pass, Fail, Blocked, or Not Run. |
| `evidence` | String optional | Relative path, redacted path, or short description. |
| `notes` | String optional | Must avoid secrets and personal data. |

### PostMvpCandidate

| Field | Type | Constraints |
|---|---|---|
| `name` | String | Unique candidate name. |
| `value` | String | User or release value. |
| `dependencies` | String array | Known prerequisites. |
| `risk` | String | Security, resiliency, usability, or scope risk. |
| `roughSize` | Enum | Small, Medium, Large, or Unknown. |
| `roadmapBand` | Enum | Next, Later, or Future. |
| `exitCriteria` | String array | Required before implementation approval. |

## Future Specification Entities

### SeriesMetadata

| Field | Type | Constraints |
|---|---|---|
| `schemaVersion` | String | Versioned JSON. |
| `seriesId` | String | Unique within Workspace. |
| `title` | String | Required. |
| `description` | String optional | Bounded length. |
| `orderedVideoIds` | String array | 0 to 100 unique existing video IDs. |
| `status` | Enum | Planned, active, complete, archived. |

**PBT Properties**:

- `seriesRoundTripPreservesOrder`.
- `seriesVideoIdsRemainUnique`.

### TemplateMetadata

| Field | Type | Constraints |
|---|---|---|
| `schemaVersion` | String | Supported versions only. |
| `templateId` | String | Unique within built-in or Workspace template scope. |
| `name` | String | Required. |
| `description` | String | Bounded length. |
| `scriptSkeleton` | Object | Must generate valid VideoScript after placeholder substitution. |
| `placeholders` | PlaceholderDefinition array | Required values typed and bounded. |
| `requiredAssets` | String array | References only, no embedded binaries. |

**PBT Properties**:

- `templateRoundTripPreservesMeaning`.
- `templateDraftIsSchemaValid`.

### PlaceholderDefinition

| Field | Type | Constraints |
|---|---|---|
| `key` | String | Unique within template. |
| `label` | String | User-facing prompt. |
| `type` | Enum | String, number, boolean, enum. |
| `required` | Boolean | Missing required placeholder rejects apply. |
| `constraints` | Object | Type-specific bounds or enum values. |

### WorkspaceReference

| Field | Type | Constraints |
|---|---|---|
| `schemaVersion` | String | Versioned `userData` JSON. |
| `canonicalPath` | String | Main-validated canonical path. |
| `displayName` | String | User-visible label. |
| `lastUsedAt` | Date/time text | Updated after successful activation. |

**PBT Properties**:

- `workspaceReferencesAreCanonicalUnique`.

## Extension Compliance

| Extension | Status | Rationale |
|---|---|---|
| Security Baseline | Compliant | Entities require bounded parsing, checksum verification, secret-safe text fields, and Main-owned future path validation. |
| Resiliency Baseline | Compliant | Entities distinguish failed, blocked, not-run, and passed states for recovery and retest workflows. |
| Property-Based Testing (Partial) | Compliant | Entities identify round-trip and invariant properties with generator-relevant constraints. |

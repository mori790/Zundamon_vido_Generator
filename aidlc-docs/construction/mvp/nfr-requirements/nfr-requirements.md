# NFR Requirements

## Scope

These non-functional requirements apply to the full Zundamon Video Generator MVP. The application is a local CLI and Remotion project for macOS, with future Linux portability kept practical.

## Performance

| Requirement | Target |
|---|---|
| Render performance | A 3-minute video should render in under 10 minutes on a typical modern Mac. |
| Voice cache | Re-running unchanged scripts must reuse generated WAV files. |
| Audio generation | Sequential generation is acceptable for MVP. |
| Video length | Architecture must support roughly 10-minute videos without redesign. |
| Timeline generation | Timeline calculation should run quickly in memory for normal script sizes. |

## Reliability

| Requirement | Target |
|---|---|
| VOICEVOX dependency | Voice generation must fail clearly when VOICEVOX Engine is unavailable. |
| Partial progress | Successfully generated WAV files and manifest entries must survive later failures. |
| Failure isolation | Validation must catch input and asset problems before expensive rendering work. |
| Render failures | Remotion and FFmpeg failures must be surfaced with actionable context. |
| Determinism | Cache hashes and timeline frame calculations must be deterministic. |

## Security and Safety

| Requirement | Target |
|---|---|
| Path safety | User-controlled JSON paths must be normalized and constrained to `public`. |
| CLI safety | External input must not be interpolated directly into shell command strings. |
| Secrets | API keys or secrets must not be hardcoded. |
| Public references | Script-referenced files must not read outside the workspace public asset area. |
| Error output | Errors should expose useful local paths but no secrets. |

Security Baseline extension is disabled, but the baseline safety requirements above remain part of the project requirements.

## Maintainability

| Requirement | Target |
|---|---|
| Module boundaries | Core logic must remain independent from Remotion components. |
| Validation source | Zod schemas should define runtime input validation. |
| Types | Shared TypeScript types must be used across CLI, core modules, tests, and Remotion props. |
| Orchestration | CLI scripts should orchestrate services and avoid embedding business logic. |
| Error model | Domain errors should carry code and context for consistent CLI messages. |
| Documentation | README and build/test instructions must explain setup, commands, and local dependencies. |

## Testability

| Requirement | Target |
|---|---|
| Unit tests | Required for validation, subtitle splitting, frame conversion, timeline calculation, cache hash, file checks, and character image selection. |
| VOICEVOX integration tests | Live integration tests fail when VOICEVOX Engine is not running. |
| Remotion render tests | Not blocking by default; manual render verification must be documented. |
| Test commands | Normal test commands should run unit tests and non-render checks. |
| Fixtures | Sample JSON and placeholder assets must support repeatable local validation. |

## Usability

| Requirement | Target |
|---|---|
| Command interface | Commands must use npm scripts as specified. |
| Logs | Default logs show major steps, cache hits, warnings, and final output. |
| Japanese messages | User-facing blocking errors should use clear Japanese messages where specified. |
| First-run setup | Sample video and placeholders should make the project understandable before real assets are added. |
| Iteration loop | `validate`, `voice`, `timeline`, `preview`, and `video` commands support incremental creator workflows. |

## Availability and Scalability

The MVP is a local tool, so uptime, failover, disaster recovery, and horizontal scaling are not applicable. Scalability is limited to local project structure and processing scripts up to roughly 10-minute videos.

## Extension Compliance Summary

- Security Baseline: N/A. Disabled during Requirements Analysis.
- Resiliency Baseline: N/A. Disabled during Requirements Analysis.
- Property-Based Testing: N/A. Disabled during Requirements Analysis.


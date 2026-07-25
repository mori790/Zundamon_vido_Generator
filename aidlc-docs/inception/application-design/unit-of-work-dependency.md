# Unit of Work Dependencies: GUI with Embedded Codex Panel

## Dependency Matrix

| Unit | Depends On | Dependency Type | Rationale |
|---|---|---|---|
| U1: Electron App Shell and Workspace Foundation | Existing project structure | Foundational | All GUI units need desktop shell and workspace state |
| U2: Codex App Server Connection | U1 | Runtime/UI | Codex panel needs app shell and workspace context |
| U3: JSON Draft Review and Scene Editing | U1 | State/Data | Draft review needs workspace and script loading |
| U4: Codex Proposal and Approval Flow | U2, U3 | Workflow | Codex proposals must become drafts or approved actions |
| U5: Asset Selection and Visual Attachment | U1, U3 | File/UI | Asset attachment edits scenes and uses file dialogs |
| U6: Command Runner and Log Panel | U1 | Process | Commands require Electron main process and workspace context |
| U7: Embedded Remotion Preview | U1, U3, U6 | Preview/Artifacts | Preview depends on script state and generated artifacts |
| U8: Render Workflow and CLI Compatibility Verification | U1, U3, U5, U6 | End-to-end | Render verification depends on scripts, assets, commands, and logs |

## Critical Path

1. U1 must be completed first.
2. U2 and U3 can proceed after U1.
3. U4 requires U2 and U3.
4. U6 can proceed after U1 and is needed for production commands.
5. U5 can proceed after U3.
6. U7 should follow U6 because preview requires generated artifacts and status handling.
7. U8 should be the final MVP integration unit.

## Parallelization Opportunities

- U2 and U3 can be developed in parallel once U1 exists.
- U5 and U6 can be developed in parallel once U1 and U3 are stable.
- U7 can start as a spike or prototype while U6 is being built, but production integration should wait for command status and artifact readiness.

## Coordination Points

- **VideoScript schema**: U3, U5, U8 must use the existing schema.
- **Workspace state**: U1 owns the primary state contract used by all units.
- **Codex proposal format**: U2 and U4 must agree on event/proposal shapes.
- **Command operation model**: U6, U7, U8 must share operation status and log types.
- **File path conventions**: U3, U5, U8 must preserve `input/`, `public/`, `generated/`, and `output/`.

## Risk Notes

- U2 has product/API uncertainty because Codex App Server behavior and auth must be validated.
- U7 has technical uncertainty because embedded Remotion preview may be harder than launching Remotion Studio.
- U3 has product safety risk because draft and active script separation must be unambiguous.
- U6 has reliability risk because long-running command logs and cancellation can be tricky in Electron.


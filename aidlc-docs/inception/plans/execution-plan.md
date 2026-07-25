# Execution Plan: GUI with Embedded Codex Panel

## Detailed Analysis Summary

### Transformation Scope

- **Transformation Type**: Brownfield application feature addition.
- **Primary Changes**: Add a local video production GUI above the existing TypeScript, Remotion, VOICEVOX, and CLI pipeline.
- **Related Components**:
  - Existing script schema and types.
  - Existing validation and asset checking services.
  - Existing voice, timeline, preview, and render commands.
  - New GUI application shell.
  - New Codex App Server integration boundary.
  - New draft JSON and approval state model.

### Change Impact Assessment

- **User-facing changes**: Yes. This introduces the primary production UI for creator workflows.
- **Structural changes**: Yes. A GUI layer, command orchestration boundary, and Codex integration boundary are needed.
- **Data model changes**: Yes. The existing `VideoScript` remains canonical, but draft proposal state and GUI session state must be designed.
- **API changes**: Internal only. No public HTTP API exists today, but GUI-to-core and GUI-to-Codex interfaces need contracts.
- **NFR impact**: Yes. Responsiveness, recoverability, approval safety, and testability affect the design.

### Component Relationships

- **Primary Component**: `zundamon-video-generator`.
- **Existing Core Components**: `src/core`, `src/schemas`, `src/types`, `scripts`, `src/components`, `src/compositions`.
- **New GUI Components**: GUI shell, editor views, Codex panel, preview panel, command runner, log panel, asset selector.
- **Integration Components**: Codex App Server adapter, local file access adapter, Remotion preview/render adapter.
- **Infrastructure Components**: None for MVP. This remains a local macOS tool.

### Risk Assessment

- **Risk Level**: High for implementation, medium for planning.
- **Rollback Complexity**: Moderate if GUI is isolated above existing CLI; difficult if core pipeline is rewritten.
- **Testing Complexity**: Complex. It spans UI state, local file operations, Codex action approval, generated artifacts, and long-running commands.

## Workflow Visualization

### Mermaid Diagram

```mermaid
flowchart TD
    Start(["User Request"])

    subgraph Inception["INCEPTION PHASE"]
        WD["Workspace Detection<br/><b>COMPLETED</b>"]
        RE["Reverse Engineering<br/><b>COMPLETED</b>"]
        RA["Requirements Analysis<br/><b>COMPLETED</b>"]
        US["User Stories<br/><b>COMPLETED</b>"]
        WP["Workflow Planning<br/><b>IN PROGRESS</b>"]
        AD["Application Design<br/><b>EXECUTE</b>"]
        UG["Units Generation<br/><b>EXECUTE</b>"]
    end

    subgraph Construction["CONSTRUCTION PHASE"]
        FD["Functional Design<br/><b>DEFER</b>"]
        NFRA["NFR Requirements<br/><b>DEFER</b>"]
        NFRD["NFR Design<br/><b>DEFER</b>"]
        ID["Infrastructure Design<br/><b>SKIP</b>"]
        CG["Code Generation<br/><b>DEFER</b>"]
        BT["Build and Test<br/><b>DEFER</b>"]
    end

    subgraph Operations["OPERATIONS PHASE"]
        OPS["Operations<br/><b>PLACEHOLDER</b>"]
    end

    Start --> WD
    WD --> RE
    RE --> RA
    RA --> US
    US --> WP
    WP --> AD
    AD --> UG
    UG -.-> FD
    FD -.-> NFRA
    NFRA -.-> NFRD
    NFRD -.-> CG
    CG -.-> BT
    BT -.-> OPS
    UG --> End(["Ideation Complete"])

    style WD fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RE fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style RA fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style US fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style WP fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style AD fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style UG fill:#FFA726,stroke:#E65100,stroke-width:3px,stroke-dasharray: 5 5,color:#000
    style FD fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style NFRA fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style NFRD fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style ID fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style CG fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style BT fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style OPS fill:#BDBDBD,stroke:#424242,stroke-width:2px,stroke-dasharray: 5 5,color:#000
    style Start fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    style End fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    style Inception fill:#BBDEFB,stroke:#1565C0,stroke-width:3px,color:#000
    style Construction fill:#C8E6C9,stroke:#2E7D32,stroke-width:3px,color:#000
    style Operations fill:#FFF59D,stroke:#F57F17,stroke-width:3px,color:#000
    linkStyle default stroke:#333,stroke-width:2px
```

### Text Alternative

- Completed: Workspace Detection, Reverse Engineering, Requirements Analysis, User Stories.
- Current: Workflow Planning.
- Recommended next: Application Design.
- Recommended after that: Units Generation.
- Deferred until explicit implementation request: Functional Design, NFR Requirements, NFR Design, Code Generation, Build and Test.
- Skipped for MVP: Infrastructure Design.

## Phases to Execute

### INCEPTION PHASE

- [x] Workspace Detection - COMPLETED
- [x] Reverse Engineering - COMPLETED
- [x] Requirements Analysis - COMPLETED
- [x] User Stories - COMPLETED
- [x] Workflow Planning - IN PROGRESS
- [ ] Application Design - EXECUTE
  - **Rationale**: New GUI components, Codex boundary, draft state, command runner, preview surface, and service dependencies need definition.
- [ ] Units Generation - EXECUTE
  - **Rationale**: The GUI concept should be decomposed into manageable units such as app shell, Codex integration, draft review, asset handling, command orchestration, and preview/render workflow.

### CONSTRUCTION PHASE

- [ ] Functional Design - DEFER
  - **Rationale**: Useful before implementation, but the user is currently refining ideas and has not asked to build the GUI yet.
- [ ] NFR Requirements - DEFER
  - **Rationale**: NFRs are known at a high level, but detailed construction-level NFR assessment should wait until implementation scope is approved.
- [ ] NFR Design - DEFER
  - **Rationale**: Depends on chosen GUI technology and integration strategy.
- [ ] Infrastructure Design - SKIP
  - **Rationale**: MVP is a local macOS tool with no cloud infrastructure.
- [ ] Code Generation - DEFER
  - **Rationale**: Implementation is intentionally deferred while the product idea is being refined.
- [ ] Build and Test - DEFER
  - **Rationale**: Build and test activities follow implementation.

### OPERATIONS PHASE

- [ ] Operations - PLACEHOLDER
  - **Rationale**: No deployment or production operations scope for this local MVP.

## Package Change Sequence

This is a single-package repository. When implementation is approved later, the likely sequence is:

1. Add GUI app shell and local server or desktop wrapper boundary.
2. Add project state and draft JSON model.
3. Add script review and scene editing UI.
4. Add asset selection and path placement flow.
5. Add command orchestration and log streaming.
6. Add Codex App Server integration.
7. Add preview and render integration.
8. Preserve and verify CLI compatibility.

## Estimated Timeline

- **Current ideation/design continuation**: 2 stages.
- **Implementation route later**: multiple construction stages, likely 6 to 8 implementation units.

## Success Criteria For This Planning Pass

- Application-level component architecture is clear.
- GUI responsibility boundaries are separated from existing CLI/rendering core.
- Codex App Server role is defined without overcommitting implementation details.
- Units of work are decomposed enough to support a later implementation plan.
- User can decide whether to proceed to implementation after reviewing design artifacts.

## Extension Compliance

- **Security Baseline**: Disabled by user choice; skipped.
- **Resiliency Baseline**: Disabled by user choice; skipped.
- **Property-Based Testing**: Disabled by user choice; skipped.


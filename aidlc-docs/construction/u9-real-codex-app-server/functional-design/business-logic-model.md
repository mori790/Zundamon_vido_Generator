# Business Logic Model: U9 Real Codex App Server Integration

## Connect and Resume

1. Renderer requests Real connect with videoId only。
2. Main validates videoId and resolves canonical Workspace root。
3. Service starts or reuses the singleton process。
4. Service completes initialize/initialized handshake。
5. Session repository loads the Workspace thread ID。
6. If no ID exists, service starts a thread and saves it。
7. If an ID exists, service attempts resume。
8. Resume failure produces `resume-failed`; session is retained。
9. Only an explicit `start-new-thread` action replaces the session ID。

## Send and Stream

1. UI validates non-empty bounded input and checks no active turn。
2. Service verifies active videoId/thread and sends turn/start。
3. UI disables Send until terminal。
4. Agent delta appends to the matching in-memory AssistantItem。
5. Item completion finalizes and persists that item as one ChatMessage。
6. Command/file-change progress updates transient UI state。
7. Turn completion releases the active-turn guard。
8. Failed/interrupted turn marks partial items `未完了` without history persistence。

## Workspace Switch

1. Workspace controller requests switch。
2. If a turn is active, service sends interrupt。
3. Service waits for terminal or bounded timeout。
4. Timeout is treated as interrupted; old generation is invalidated。
5. Renderer unsubscribes old Workspace listeners。
6. New Workspace connection performs its own session load/resume。

## Approval Mediation

1. Protocol codec validates a recognized server request。
2. Approval Controller creates bounded display data and deadline。
3. UI renders dedicated Pending Approval card。
4. User approves or denies。
5. Controller atomically transitions pending to terminal and emits one response。
6. Timeout、disconnect、shutdown、unknown request produce deny。
7. Duplicate terminal input has no effect。

## Failure Classification

- `codex-not-found`: Installation guidance。
- `authentication-required`: Existing Codex login guidance。
- `initialize-failed`: Manual reconnect。
- `resume-failed`: Start-new-thread option without automatic replacement。
- `protocol-invalid`: Connection failed, safe diagnostic code only。
- `request-timeout`: Failed operation and bounded reconnect policy。
- `process-exited`: Active turn interrupted and pending approvals denied。

## Testable Properties

- Protocol round-trip and bounds。
- Correlation independent of response ordering。
- Approval exactly-once stateful model。
- Turn terminal monotonicity。
- Session parse validity。
- Completed assistant item order preservation。

Each critical flow also requires explicit example tests for happy path、auth failure、resume failure、deny、timeout、interrupt、malformed protocol。

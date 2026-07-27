# Frontend Components: U8 Render Workflow and CLI Compatibility Verification

## Component Hierarchy

- `WorkspaceShell`
  - `RenderWorkflow`
    - `RenderReadinessStatus`
    - `OverwriteConfirmation`
    - `RenderResult`
  - U6 `ProductionCommandPanel`
    - Existing Render button
    - Existing operation status
    - Existing Log Panel

## RenderWorkflow

### Inputs

- Current `videoId`。
- U7-compatible readiness check。
- U6 command start and terminal operation notification。
- Canonical output existence and Finder boundary。

### State

- Readiness。
- Output existence。
- Overwrite confirmation open/closed。
- Current RenderOutcome。

### Behavior

- Render request前にreadinessとoutput existenceを確認する。
- Missing/staleの場合はoperationを開始せず、必要なVoiceまたはTimelineを表示する。
- Existing outputがある場合はconfirmationを開く。
- Confirm後にU6 Renderを開始する。
- Success時はpathとFinder action、failure時は既存errorとlogsを表示する。

## RenderReadinessStatus

- Ready、missing、staleを色だけでなくtext表示する。
- Block時は不足artifactと必要なoperationを列挙する。
- U8からVoiceまたはTimelineを自動実行しない。

## OverwriteConfirmation

- `output/{videoId}.mp4` を上書きすることを明示する。
- 「上書きしてRender」と「キャンセル」を提供する。
- Keyboard操作、visible focus、accessible dialog nameを持つ。
- Cancelまたはdialog closeではcommandを開始しない。

## RenderResult

- Success時にcanonical output pathを表示する。
- 「Finderで表示」を提供する。
- Output missing時はactionを無効化し、text errorを表示する。
- 動画を直接開く操作はMVPに含めない。

## ProductionCommandPanel Reuse

- Existing Render button、Stop、status、logsを再利用する。
- Render failureの専用Retry buttonは追加しない。
- 利用者は既存Render buttonから再実行する。
- Codex診断promptを自動生成しない。

## Interaction Flows

### Ready and New Output

1. 利用者がRenderを選択する。
2. Readinessがready、outputがmissingであることを確認する。
3. U6 Renderを開始する。
4. Success後にpathとFinder actionを表示する。

### Existing Output

1. 利用者がRenderを選択する。
2. Existing outputを検出してconfirmationを表示する。
3. Confirm時だけU6 Renderを開始する。

### Blocked

1. Missingまたはstale artifactを検出する。
2. Renderを開始しない。
3. 必要なVoiceまたはTimeline操作を表示する。

### Failure

1. U6がfailed operationとlogsを通知する。
2. Production Panelがerrorとlogsを表示する。
3. 利用者が修正後、既存Render buttonから再実行する。

## Traceability

- US-16: RenderWorkflow、OverwriteConfirmation、RenderResult。
- US-17: Existing ProductionCommandPanel。
- US-19: Failure state、logs、manual retry。
- US-2: Canonical pathsとexisting command boundary。


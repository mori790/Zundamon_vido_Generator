# Component Methods: GUI with Embedded Codex Panel

## Type Names

```ts
type VideoId = string;
type DraftStatus = 'none' | 'draft' | 'reviewing' | 'invalid' | 'applied' | 'discarded';
type OperationName = 'validate' | 'voice' | 'timeline' | 'preview' | 'render';
type OperationStatus = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed';
```

## C1: Electron App Shell

```ts
createMainWindow(): Promise<void>
registerIpcHandlers(): void
showOpenImageDialog(): Promise<string[]>
```

- Opens the primary desktop window.
- Registers safe bridges for file picking, file operations, and command execution.

## C2: Workspace Controller

```ts
openWorkspace(videoId: VideoId): Promise<WorkspaceState>
createWorkspace(videoId: VideoId): Promise<WorkspaceState>
refreshArtifactStatus(videoId: VideoId): Promise<ArtifactStatus>
setActiveScript(script: VideoScript): void
getWorkspaceState(): WorkspaceState
```

- Owns the single-video workspace state.
- Coordinates active script, draft state, artifacts, and command readiness.

## C3: Script Repository Adapter

```ts
loadScript(videoId: VideoId): Promise<VideoScript | null>
saveScript(videoId: VideoId, script: VideoScript): Promise<void>
scriptExists(videoId: VideoId): Promise<boolean>
getScriptPath(videoId: VideoId): string
```

- Reads and writes canonical `input/{videoId}.json`.
- Does not store draft proposals.

## C4: Draft State Store

```ts
createDraft(source: 'codex' | 'manual', script: unknown): DraftState
updateDraft(script: unknown): DraftState
markDraftInvalid(errors: ValidationIssue[]): DraftState
markDraftApplied(): DraftState
discardDraft(): DraftState
getDraft(): DraftState
```

- Holds draft script state in memory only.
- Separates unapplied JSON from the active script.

## C5: Codex Panel

```ts
sendMessage(text: string): Promise<void>
receiveCodexEvent(event: CodexEvent): void
showActionProposal(action: ProposedAction): void
attachDraftProposal(script: unknown): void
```

- Manages chat messages and Codex-proposed drafts/actions.

## C6: Codex App Server Client

```ts
connect(): Promise<CodexConnectionState>
disconnect(): Promise<void>
sendUserMessage(text: string, context: CodexContext): Promise<void>
onEvent(handler: (event: CodexEvent) => void): Unsubscribe
getConnectionState(): CodexConnectionState
```

- Communicates directly with Codex App Server from the GUI layer.
- Converts protocol-level events into app-level events.

## C7: Action Approval Controller

```ts
registerProposal(action: ProposedAction): ApprovalState
approveAction(actionId: string): Promise<ActionResult>
rejectAction(actionId: string): ApprovalState
getPendingActions(): ProposedAction[]
```

- Ensures save and command actions require explicit approval.
- MVP UI renders approvals inline inside Codex messages.

## C8: JSON Review UI

```ts
setReviewMode(mode: 'raw' | 'structured'): void
editRawJson(text: string): DraftState
editStructuredScene(sceneId: string, patch: Partial<Scene>): DraftState
applyDraft(): Promise<void>
discardDraft(): void
```

- Presents both raw JSON and structured scene views.

## C9: Scene Editor

```ts
addScene(scene: Scene): DraftState
removeScene(sceneId: string): DraftState
reorderScene(sceneId: string, targetIndex: number): DraftState
updateScene(sceneId: string, patch: Partial<Scene>): DraftState
```

- Updates scene data in the editable script state.

## C10: Asset Manager

```ts
selectImages(): Promise<LocalAssetSelection[]>
copyVisualAsset(videoId: VideoId, sourcePath: string): Promise<PublicAssetRef>
attachVisualToScene(sceneId: string, asset: PublicAssetRef): DraftState
checkVisualAssets(script: VideoScript): Promise<AssetCheckResult>
```

- Handles local image selection and public path creation.

## C11: Validation Adapter

```ts
validateDraft(script: unknown): ValidationResult
validateActiveScript(videoId: VideoId): Promise<ValidationResult>
formatValidationIssues(error: unknown): ValidationIssue[]
```

- Validates in-memory drafts and active scripts.

## C12: Command Runner

```ts
runOperation(videoId: VideoId, operation: OperationName): Promise<OperationResult>
cancelOperation(operationId: string): Promise<void>
onLog(handler: (entry: LogEntry) => void): Unsubscribe
getOperationStatus(operationId: string): OperationStatus
```

- Runs existing npm commands through Electron main process.

## C13: Log Panel

```ts
appendLog(entry: LogEntry): void
clearLogs(scope?: OperationName): void
getLogs(scope?: OperationName): LogEntry[]
exportLogsForCodex(scope?: OperationName): CodexLogContext
```

- Shows logs and can provide selected logs as Codex context.

## C14: Preview Panel

```ts
loadPreview(videoId: VideoId): Promise<void>
refreshPreview(): Promise<void>
markPreviewStale(reason: string): void
openPreviewFallback(videoId: VideoId): Promise<void>
```

- Targets embedded preview first.
- Keeps Remotion Studio fallback as a recovery path.

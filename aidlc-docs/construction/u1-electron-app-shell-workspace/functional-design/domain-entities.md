# Domain Entities: U1 Electron App Shell and Workspace Foundation

## `VideoProjectSummary`

Represents a script discovered in `input/`.

```ts
type VideoProjectSummary = {
  videoId: string;
  fileName: string;
  filePath: string;
  lastModifiedAt?: string;
};
```

## `WorkspaceState`

Represents the currently opened video workspace.

```ts
type WorkspaceState = {
  videoId: string;
  mode: 'existing-script' | 'empty-draft';
  activeScript: VideoScript | null;
  error: WorkspaceError | null;
};
```

## `WorkspaceError`

Represents a workspace-opening failure.

```ts
type WorkspaceError = {
  code: 'invalid-video-id' | 'invalid-script' | 'file-system-error';
  message: string;
  targetPath?: string;
};
```

## `StartScreenState`

Represents the initial project selection UI.

```ts
type StartScreenState = {
  projects: VideoProjectSummary[];
  newVideoId: string;
  loading: boolean;
  error: WorkspaceError | null;
};
```

## `ArtifactStatus`

Placeholder for later units. U1 may initialize it, but does not compute full generation readiness.

```ts
type ArtifactStatus = {
  audio: 'unknown' | 'missing' | 'present';
  timeline: 'unknown' | 'missing' | 'present';
  output: 'unknown' | 'missing' | 'present';
};
```


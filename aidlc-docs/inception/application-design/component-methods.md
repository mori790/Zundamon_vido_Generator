# Component Methods

## Script and Validation

```ts
export function loadVideoScript(videoId: string, options?: LoadScriptOptions): Promise<VideoScript>;
export function parseVideoScript(input: unknown): VideoScript;
export function validateVideoId(videoId: string): void;
export function collectScriptWarnings(script: VideoScript): ValidationWarning[];
```

- `loadVideoScript` reads and validates `input/{videoId}.json`.
- `parseVideoScript` is the Zod-backed runtime boundary.
- `validateVideoId` prevents unsafe IDs and mismatched input.
- `collectScriptWarnings` reports non-blocking script concerns.

## Asset and Path Handling

```ts
export function resolveWorkspacePath(...segments: string[]): string;
export function resolveInputScriptPath(videoId: string): string;
export function resolvePublicReference(publicPath: string): string;
export function resolveAudioPath(videoId: string, sceneId: string): AudioPathInfo;
export function checkAssets(script: VideoScript): Promise<AssetCheckResult>;
```

- `resolvePublicReference` accepts paths like `/visuals/topic/image.png` and maps them inside `public`.
- `checkAssets` validates visuals, background, BGM, and character assets.

## VOICEVOX and Voice Cache

```ts
export function createVoicevoxClient(config: VoicevoxConfig): VoicevoxClient;
export function checkVoicevoxConnection(client: VoicevoxClient): Promise<void>;
export function createAudioQuery(client: VoicevoxClient, text: string, speakerId: number): Promise<VoicevoxAudioQuery>;
export function synthesizeSpeech(client: VoicevoxClient, query: VoicevoxAudioQuery, speakerId: number): Promise<ArrayBuffer>;
export function buildVoiceCacheHash(text: string, speaker: SpeakerConfig): string;
export function loadManifest(videoId: string): Promise<VoiceManifest>;
export function saveManifest(videoId: string, manifest: VoiceManifest): Promise<void>;
export function generateVoices(videoId: string, options?: VoiceGenerationOptions): Promise<VoiceGenerationResult>;
```

- `createVoicevoxClient` centralizes base URL configuration.
- `generateVoices` owns cache decisions and sequential generation.
- `buildVoiceCacheHash` is deterministic and independent of file paths.

## Audio and Timeline

```ts
export function measureWavDuration(filePath: string): Promise<number>;
export function secondsToFrames(seconds: number, fps: number): number;
export function generateTimeline(script: VideoScript, manifest: VoiceManifest): Timeline;
export function saveTimeline(videoId: string, timeline: Timeline): Promise<void>;
export function loadTimeline(videoId: string): Promise<Timeline>;
```

- `measureWavDuration` returns seconds.
- `secondsToFrames` rounds `seconds * fps`.
- `generateTimeline` produces ordered scene frame data.

## Render Data and Remotion

```ts
export function buildRenderData(videoId: string): Promise<ZundamonRenderData>;
export function renderVideo(videoId: string, options?: RenderOptions): Promise<RenderResult>;
export function getCompositionProps(videoId: string): Promise<ZundamonCompositionProps>;
```

- `buildRenderData` combines script, manifest, and timeline.
- `renderVideo` uses Remotion Node APIs.
- `getCompositionProps` returns props suitable for Remotion Studio or render.

## CLI

```ts
export function runValidateCommand(argv: string[]): Promise<void>;
export function runVoiceCommand(argv: string[]): Promise<void>;
export function runTimelineCommand(argv: string[]): Promise<void>;
export function runPreviewCommand(argv: string[]): Promise<void>;
export function runVideoCommand(argv: string[]): Promise<void>;
```

- CLI functions parse arguments, call services, log results, and map failures to user-facing messages.

## React Components

```tsx
export function ZundamonVideo(props: ZundamonCompositionProps): JSX.Element;
export function Scene(props: SceneProps): JSX.Element;
export function Character(props: CharacterProps): JSX.Element;
export function Subtitle(props: SubtitleProps): JSX.Element | null;
export function Visual(props: VisualProps): JSX.Element | null;
export function TitleScene(props: TitleSceneProps): JSX.Element;
export function EndingScene(props: EndingSceneProps): JSX.Element;
```

- React components render data only and do not perform file system or network work.


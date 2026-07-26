export type SceneType = 'title' | 'explanation' | 'code' | 'summary' | 'ending';
export type Emotion = 'normal' | 'happy' | 'surprised' | 'troubled';
export type VisualPosition = 'left' | 'center' | 'right';
export type VisualFit = 'contain' | 'cover';

export type SpeakerConfig = {
  engine: 'voicevox';
  speakerId: number;
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
};

export type VideoConfig = {
  width: number;
  height: number;
  fps: number;
  background?: string;
  bgm?: string;
  bgmVolume: number;
};

export type SubtitleConfig = {
  enabled: boolean;
  maxCharactersPerLine: number;
  maxLines: number;
  fontSize: number;
  bottom: number;
  highlightKeywords: string[];
};

export type ImageVisual = {
  type: 'image';
  src: string;
  position: VisualPosition;
  fit: VisualFit;
};

export type CodeVisual = {
  type: 'code';
  language?: string;
  code: string;
  fileName?: string;
};

export type TextVisual = {
  type: 'text';
  heading?: string;
  body: string;
};

export type NoneVisual = {
  type: 'none';
};

export type VisualConfig = ImageVisual | CodeVisual | TextVisual | NoneVisual;

export type Scene = {
  id: string;
  type: SceneType;
  text: string;
  emotion: Emotion;
  visual?: VisualConfig;
  durationBeforeSpeech: number;
  durationAfterSpeech: number;
  characterVisible: boolean;
};

export type VideoScript = {
  id: string;
  title: string;
  description?: string;
  speaker: SpeakerConfig;
  video: VideoConfig;
  subtitle: SubtitleConfig;
  scenes: Scene[];
};

export type VoiceManifestEntry = {
  hash: string;
  audioPath: string;
  durationSeconds: number;
};

export type VoiceManifest = {
  videoId: string;
  scenes: Record<string, VoiceManifestEntry>;
};

export type TimelineScene = {
  id: string;
  startFrame: number;
  audioStartFrame: number;
  durationInFrames: number;
  audioDurationInFrames: number;
  audioPath: string;
};

export type Timeline = {
  videoId: string;
  fps: number;
  totalFrames: number;
  scenes: TimelineScene[];
};

export type ValidationIssue = {
  code: string;
  message: string;
  videoId?: string;
  sceneId?: string;
  targetPath?: string;
};

export type AssetCheckResult = {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type VoiceGenerationOptions = {
  force?: boolean;
  verbose?: boolean;
};

export type VoiceGenerationResult = {
  videoId: string;
  generated: string[];
  cached: string[];
  manifest: VoiceManifest;
};

export type RenderOptions = {
  verbose?: boolean;
  onProgress?(progress: import('../studio/shared/command').RenderProgress): void;
};

export type RenderResult = {
  videoId: string;
  outputPath: string;
};

export type ZundamonCompositionProps = {
  script: VideoScript;
  timeline: Timeline;
  manifest: VoiceManifest;
};

export type AudioPathInfo = {
  filePath: string;
  publicPath: string;
};

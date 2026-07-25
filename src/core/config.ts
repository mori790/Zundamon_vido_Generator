import path from 'node:path';

export const workspaceRoot = process.cwd();

export const env = {
  voicevoxBaseUrl: process.env.VOICEVOX_BASE_URL ?? 'http://localhost:50021',
  defaultSpeakerId: Number(process.env.DEFAULT_SPEAKER_ID ?? 3),
  outputDir: process.env.OUTPUT_DIR ?? 'output',
  audioDir: process.env.AUDIO_DIR ?? 'public/audio',
  defaultFps: Number(process.env.DEFAULT_FPS ?? 30),
  defaultWidth: Number(process.env.DEFAULT_WIDTH ?? 1920),
  defaultHeight: Number(process.env.DEFAULT_HEIGHT ?? 1080),
};

export const directories = {
  input: path.join(workspaceRoot, 'input'),
  public: path.join(workspaceRoot, 'public'),
  generated: path.join(workspaceRoot, 'generated'),
  manifests: path.join(workspaceRoot, 'generated', 'manifests'),
  timelines: path.join(workspaceRoot, 'generated', 'timelines'),
  output: path.join(workspaceRoot, env.outputDir),
};

export const sampleVideoIds = new Set(['sample-video']);

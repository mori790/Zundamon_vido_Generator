const runtimeEnv = typeof process === 'undefined' ? {} : process.env;

export const env = {
  voicevoxBaseUrl: runtimeEnv.VOICEVOX_BASE_URL ?? 'http://localhost:50021',
  defaultSpeakerId: Number(runtimeEnv.DEFAULT_SPEAKER_ID ?? 3),
  outputDir: runtimeEnv.OUTPUT_DIR ?? 'output',
  audioDir: runtimeEnv.AUDIO_DIR ?? 'public/audio',
  defaultFps: Number(runtimeEnv.DEFAULT_FPS ?? 30),
  defaultWidth: Number(runtimeEnv.DEFAULT_WIDTH ?? 1920),
  defaultHeight: Number(runtimeEnv.DEFAULT_HEIGHT ?? 1080),
};

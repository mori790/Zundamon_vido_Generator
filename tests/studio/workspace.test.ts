import {describe, expect, it} from 'vitest';
import {
  createEmptyDraftWorkspace,
  createExistingWorkspace,
  createInvalidScriptError,
  normalizeVideoId,
  validateVideoId,
} from '../../src/studio/shared/workspace';
import type {VideoScript} from '../../src/types/video';

const script: VideoScript = {
  id: 'sample-video',
  title: 'Sample',
  speaker: {
    engine: 'voicevox',
    speakerId: 3,
    speedScale: 1,
    pitchScale: 0,
    intonationScale: 1,
    volumeScale: 1,
  },
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    bgmVolume: 0.1,
  },
  subtitle: {
    enabled: true,
    maxCharactersPerLine: 24,
    maxLines: 2,
    fontSize: 56,
    bottom: 50,
    highlightKeywords: [],
  },
  scenes: [
    {
      id: 'scene-001',
      type: 'explanation',
      text: 'テストなのだ。',
      emotion: 'normal',
      durationBeforeSpeech: 0.2,
      durationAfterSpeech: 0.3,
      characterVisible: true,
    },
  ],
};

describe('workspace shared logic', () => {
  it('normalizes video IDs', () => {
    expect(normalizeVideoId(' sample-video ')).toBe('sample-video');
  });

  it('rejects empty and traversal-like video IDs', () => {
    expect(validateVideoId('')?.code).toBe('invalid-video-id');
    expect(validateVideoId('../bad')?.code).toBe('invalid-video-id');
    expect(validateVideoId('bad/name')?.code).toBe('invalid-video-id');
  });

  it('creates existing-script workspace state', () => {
    const workspace = createExistingWorkspace('sample-video', script);
    expect(workspace.mode).toBe('existing-script');
    expect(workspace.activeScript?.id).toBe('sample-video');
  });

  it('creates empty-draft workspace state', () => {
    const workspace = createEmptyDraftWorkspace('new-video');
    expect(workspace.mode).toBe('empty-draft');
    expect(workspace.activeScript).toBeNull();
  });

  it('creates invalid script errors with target path', () => {
    const error = createInvalidScriptError('input/broken.json');
    expect(error.code).toBe('invalid-script');
    expect(error.targetPath).toBe('input/broken.json');
  });
});


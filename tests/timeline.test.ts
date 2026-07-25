import {describe, expect, it} from 'vitest';
import {generateTimeline} from '../src/core/timeline-generator';
import type {VideoScript, VoiceManifest} from '../src/types/video';

const script: VideoScript = {
  id: 'sample-video',
  title: 'Sample',
  speaker: {engine: 'voicevox', speakerId: 3, speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1},
  video: {width: 1920, height: 1080, fps: 30, bgmVolume: 0.1},
  subtitle: {enabled: true, maxCharactersPerLine: 24, maxLines: 2, fontSize: 56, bottom: 50, highlightKeywords: []},
  scenes: [
    {id: 'scene-001', type: 'explanation', text: 'a', emotion: 'normal', durationBeforeSpeech: 0.2, durationAfterSpeech: 0.3, characterVisible: true},
    {id: 'scene-002', type: 'ending', text: 'b', emotion: 'happy', durationBeforeSpeech: 0.2, durationAfterSpeech: 0.3, characterVisible: true},
  ],
};

const manifest: VoiceManifest = {
  videoId: 'sample-video',
  scenes: {
    'scene-001': {hash: 'a', audioPath: '/audio/sample-video/scene-001.wav', durationSeconds: 1},
    'scene-002': {hash: 'b', audioPath: '/audio/sample-video/scene-002.wav', durationSeconds: 2},
  },
};

describe('generateTimeline', () => {
  it('creates cumulative frame timing', () => {
    const timeline = generateTimeline(script, manifest);
    expect(timeline.scenes[0]?.startFrame).toBe(0);
    expect(timeline.scenes[0]?.durationInFrames).toBe(45);
    expect(timeline.scenes[1]?.startFrame).toBe(45);
    expect(timeline.totalFrames).toBe(120);
  });
});

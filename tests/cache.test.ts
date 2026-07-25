import {describe, expect, it} from 'vitest';
import {buildVoiceCacheHash} from '../src/core/voice-generator';
import type {SpeakerConfig} from '../src/types/video';

const speaker: SpeakerConfig = {
  engine: 'voicevox',
  speakerId: 3,
  speedScale: 1,
  pitchScale: 0,
  intonationScale: 1,
  volumeScale: 1,
};

describe('buildVoiceCacheHash', () => {
  it('is deterministic for the same text and settings', () => {
    expect(buildVoiceCacheHash('hello', speaker)).toBe(buildVoiceCacheHash('hello', speaker));
  });

  it('changes when voice settings change', () => {
    expect(buildVoiceCacheHash('hello', speaker)).not.toBe(
      buildVoiceCacheHash('hello', {...speaker, speedScale: 1.1}),
    );
  });
});

import {describe, expect, it} from 'vitest';
import {parseVideoScript} from '../src/core/script-loader';

describe('parseVideoScript', () => {
  it('applies defaults and validates a minimal script', () => {
    const script = parseVideoScript({
      id: 'sample-video',
      title: 'Sample',
      speaker: {engine: 'voicevox', speakerId: 3},
      video: {},
      subtitle: {},
      scenes: [{id: 'scene-001', type: 'explanation', text: 'hello'}],
    });

    expect(script.video.width).toBe(1920);
    expect(script.scenes[0]?.emotion).toBe('normal');
  });

  it('rejects duplicate scene IDs', () => {
    expect(() =>
      parseVideoScript({
        id: 'sample-video',
        title: 'Sample',
        speaker: {engine: 'voicevox', speakerId: 3},
        video: {},
        subtitle: {},
        scenes: [
          {id: 'scene-001', type: 'explanation', text: 'hello'},
          {id: 'scene-001', type: 'ending', text: 'bye'},
        ],
      }),
    ).toThrow(/重複/);
  });
});

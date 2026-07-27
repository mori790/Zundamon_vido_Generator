import {describe, expect, it} from 'vitest';
import {buildVideoScript, resolveSceneType} from '../../src/studio/shared/script-builder';
import type {SceneWithAsset} from '../../src/studio/shared/scene-segmentation';

const makeScene = (index: number, assetPublicPath: string | null = null): SceneWithAsset => ({
  id: `scene-${String(index + 1).padStart(3, '0')}`,
  title: `Title ${index}`,
  narration: `Narration ${index}`,
  tags: ['tag'],
  assetPublicPath,
  assetFileName: assetPublicPath ? 'img.png' : null,
});

describe('resolveSceneType', () => {
  it('returns title for index 0', () => {
    expect(resolveSceneType(0, 3)).toBe('title');
  });

  it('returns ending for last index', () => {
    expect(resolveSceneType(2, 3)).toBe('ending');
  });

  it('returns explanation for middle index', () => {
    expect(resolveSceneType(1, 3)).toBe('explanation');
  });

  it('returns title when total is 1 (first wins over last)', () => {
    expect(resolveSceneType(0, 1)).toBe('title');
  });

  it('returns ending for index 1 in 2-scene list', () => {
    expect(resolveSceneType(1, 2)).toBe('ending');
  });
});

describe('buildVideoScript', () => {
  it('sets id and title', () => {
    const script = buildVideoScript([makeScene(0)], 'my-video', 'My Title');
    expect(script.id).toBe('my-video');
    expect(script.title).toBe('My Title');
  });

  it('maps narration to text', () => {
    const script = buildVideoScript([makeScene(0)], 'v', 't');
    expect(script.scenes[0].text).toBe('Narration 0');
  });

  it('sets emotion to normal', () => {
    const script = buildVideoScript([makeScene(0)], 'v', 't');
    expect(script.scenes[0].emotion).toBe('normal');
  });

  it('maps assetPublicPath to image visual', () => {
    const script = buildVideoScript([makeScene(0, '/visuals/v/img.png')], 'v', 't');
    expect(script.scenes[0].visual).toEqual({
      type: 'image',
      src: '/visuals/v/img.png',
      position: 'center',
      fit: 'contain',
    });
  });

  it('maps null assetPublicPath to none visual', () => {
    const script = buildVideoScript([makeScene(0, null)], 'v', 't');
    expect(script.scenes[0].visual).toEqual({type: 'none'});
  });

  it('maps scene types correctly for 3 scenes', () => {
    const script = buildVideoScript([makeScene(0), makeScene(1), makeScene(2)], 'v', 't');
    expect(script.scenes[0].type).toBe('title');
    expect(script.scenes[1].type).toBe('explanation');
    expect(script.scenes[2].type).toBe('ending');
  });

  it('sets durationBeforeSpeech and durationAfterSpeech', () => {
    const script = buildVideoScript([makeScene(0)], 'v', 't');
    expect(script.scenes[0].durationBeforeSpeech).toBe(0.2);
    expect(script.scenes[0].durationAfterSpeech).toBe(0.3);
  });

  it('sets characterVisible to true', () => {
    const script = buildVideoScript([makeScene(0)], 'v', 't');
    expect(script.scenes[0].characterVisible).toBe(true);
  });

  it('preserves scene id', () => {
    const script = buildVideoScript([makeScene(0)], 'v', 't');
    expect(script.scenes[0].id).toBe('scene-001');
  });
});

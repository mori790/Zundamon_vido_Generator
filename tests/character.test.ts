import {describe, expect, it} from 'vitest';
import {selectCharacterAsset} from '../src/utils/text';

describe('selectCharacterAsset', () => {
  it('selects sample SVG placeholders for sample-video', () => {
    expect(selectCharacterAsset('happy', true, 'sample-video')).toBe('/characters/zundamon/happy-open.svg');
  });

  it('falls back to normal and png for user videos', () => {
    expect(selectCharacterAsset('unknown', false, 'my-video')).toBe('/characters/zundamon/normal-close.png');
  });
});

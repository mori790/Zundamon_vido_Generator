import {describe, expect, it} from 'vitest';
import {secondsToFrames} from '../src/utils/frame';

describe('secondsToFrames', () => {
  it('rounds seconds multiplied by fps', () => {
    expect(secondsToFrames(3.42, 30)).toBe(103);
    expect(secondsToFrames(0.2, 30)).toBe(6);
  });
});

import {describe, expect, it, vi} from 'vitest';
import {createRenderProgressReporter} from '../src/core/render-progress';

describe('render progress reporter', () => {
  it('throttles updates, keeps progress monotonic, and always emits 100%', () => {
    let time = 0;
    const emit = vi.fn();
    const report = createRenderProgressReporter(100, emit, () => time, 250);
    report(10, 0.1);
    time = 100;
    report(5, 0.05);
    time = 300;
    report(30, 0.3);
    time = 301;
    report(100, 1);
    expect(emit.mock.calls.map(([progress]) => progress.fraction)).toEqual([0.1, 0.3, 1]);
    expect(emit.mock.calls[1][0].etaSeconds).toBeCloseTo(0.7);
    expect(emit.mock.calls[2][0]).toMatchObject({renderedFrames: 100, totalFrames: 100});
  });
});

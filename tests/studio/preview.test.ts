import {describe, expect, it, vi} from 'vitest';
import {assessPreview, createLatestQueuedRunner} from '../../src/studio/shared/preview';

describe('preview shared model', () => {
  it('requests voice then timeline for missing or stale artifacts', () => {
    expect(assessPreview({
      videoId: 'sample-video',
      scriptModifiedAt: 20,
      manifestModifiedAt: 10,
      timelineModifiedAt: 15,
    })).toMatchObject({
      ready: false,
      stale: ['manifest', 'timeline'],
      requiredOperations: ['voice', 'timeline'],
    });
  });

  it('reports ready data and capacity warnings', () => {
    expect(assessPreview({
      videoId: 'sample-video',
      scriptModifiedAt: 10,
      manifestModifiedAt: 20,
      timelineModifiedAt: 30,
      width: 3840,
      height: 2160,
      fps: 60,
      totalFrames: 120_000,
    })).toMatchObject({ready: true, requiredOperations: []});
    expect(assessPreview({
      videoId: 'sample-video',
      scriptModifiedAt: 10,
      manifestModifiedAt: 20,
      timelineModifiedAt: 30,
      width: 3840,
      height: 2160,
      fps: 60,
      totalFrames: 120_000,
    }).capacityWarning).toContain('推奨上限');
  });

  it('coalesces refreshes to the running request plus the latest queued request', async () => {
    let release!: () => void;
    const task = vi.fn(() => new Promise<void>((resolve) => {
      release = resolve;
    }));
    const runner = createLatestQueuedRunner(task);
    const first = runner.run();
    const second = runner.run();
    runner.run();
    release();
    await Promise.resolve();
    release();
    await Promise.all([first, second]);
    expect(task).toHaveBeenCalledTimes(2);
  });
});

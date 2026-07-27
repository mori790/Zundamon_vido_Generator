import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPreviewDataService} from '../../src/studio/main/preview-data-service';

describe('preview data service', () => {
  const mocks = {
    stat: vi.fn(),
    loadScript: vi.fn(),
    loadTimeline: vi.fn(),
    buildRenderData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadScript.mockResolvedValue({video: {width: 1920, height: 1080, fps: 30}});
    mocks.loadTimeline.mockResolvedValue({totalFrames: 300});
  });

  it('reports missing artifacts', async () => {
    mocks.stat.mockRejectedValue(Object.assign(new Error('missing'), {code: 'ENOENT'}));
    await expect(createPreviewDataService(mocks).check('sample-video')).resolves.toMatchObject({
      readiness: {
        ready: false,
        missing: ['script', 'manifest', 'timeline'],
        requiredOperations: ['voice', 'timeline'],
      },
    });
  });

  it('reports stale and ready timestamps', async () => {
    mocks.stat
      .mockResolvedValueOnce({mtimeMs: 30})
      .mockResolvedValueOnce({mtimeMs: 10})
      .mockResolvedValueOnce({mtimeMs: 20});
    expect((await createPreviewDataService(mocks).check('sample-video')).readiness.stale).toEqual(['manifest', 'timeline']);

    mocks.stat.mockReset();
    mocks.stat
      .mockResolvedValueOnce({mtimeMs: 10})
      .mockResolvedValueOnce({mtimeMs: 20})
      .mockResolvedValueOnce({mtimeMs: 30});
    expect((await createPreviewDataService(mocks).check('sample-video')).readiness.ready).toBe(true);
  });

  it('loads only ready render data and rejects missing data', async () => {
    mocks.stat.mockResolvedValue({mtimeMs: 10});
    mocks.buildRenderData.mockResolvedValue({script: {}, manifest: {}, timeline: {}});
    const service = createPreviewDataService(mocks);
    await expect(service.load('sample-video')).resolves.toMatchObject({inputProps: {script: {}}});

    mocks.stat.mockRejectedValue(Object.assign(new Error('missing'), {code: 'ENOENT'}));
    await expect(service.load('sample-video')).rejects.toThrow('未生成または古く');
    expect(mocks.buildRenderData).toHaveBeenCalledTimes(1);
  });

  it('rejects unsafe video IDs before filesystem access', async () => {
    await expect(createPreviewDataService(mocks).check('../bad')).rejects.toThrow('動画IDが不正');
    expect(mocks.stat).not.toHaveBeenCalled();
  });
});

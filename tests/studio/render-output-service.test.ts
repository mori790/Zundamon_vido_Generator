import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createRenderOutputService} from '../../src/studio/main/render-output-service';

describe('render output service', () => {
  const dependencies = {
    stat: vi.fn(),
    confirm: vi.fn(),
    reveal: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('distinguishes missing, zero-byte, and verified output', async () => {
    dependencies.stat.mockRejectedValueOnce(Object.assign(new Error('missing'), {code: 'ENOENT'}));
    const service = createRenderOutputService(dependencies);
    expect(await service.status('sample-video')).toMatchObject({exists: false, nonZero: false});

    dependencies.stat.mockResolvedValueOnce({isFile: () => true, size: 0});
    await expect(service.verify('sample-video')).rejects.toThrow('空です');

    dependencies.stat.mockResolvedValueOnce({isFile: () => true, size: 10});
    await expect(service.verify('sample-video')).resolves.toMatchObject({exists: true, nonZero: true});
  });

  it('confirms overwrite and reveals only canonical verified output', async () => {
    dependencies.stat.mockResolvedValue({isFile: () => true, size: 10});
    dependencies.confirm.mockResolvedValue(true);
    const service = createRenderOutputService(dependencies);
    await expect(service.confirmOverwrite('sample-video')).resolves.toBe(true);
    await expect(service.reveal('sample-video')).resolves.toBe(true);
    expect(dependencies.confirm.mock.calls[0][0]).toMatch(/output\/sample-video\.mp4$/);
    expect(dependencies.reveal.mock.calls[0][0]).toMatch(/output\/sample-video\.mp4$/);
  });

  it('rejects unsafe video IDs before file access', async () => {
    const service = createRenderOutputService(dependencies);
    await expect(service.status('../bad')).rejects.toThrow('動画IDが不正');
    expect(dependencies.stat).not.toHaveBeenCalled();
  });
});

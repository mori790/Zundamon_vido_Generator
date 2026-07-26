import {afterEach, describe, expect, it, vi} from 'vitest';
import {renderClient} from '../../src/studio/renderer/render-client';

describe('render client', () => {
  afterEach(() => delete globalThis.renderOutputApi);

  it('delegates videoId-only output operations', async () => {
    globalThis.renderOutputApi = {
      status: vi.fn().mockResolvedValue({videoId: 'sample-video', outputPath: 'output/sample-video.mp4'}),
      confirmOverwrite: vi.fn().mockResolvedValue(true),
      reveal: vi.fn().mockResolvedValue(true),
    };
    await renderClient.status('sample-video');
    await renderClient.confirmOverwrite('sample-video');
    await renderClient.reveal('sample-video');
    expect(globalThis.renderOutputApi.status).toHaveBeenCalledWith('sample-video');
    expect(globalThis.renderOutputApi.confirmOverwrite).toHaveBeenCalledWith('sample-video');
    expect(globalThis.renderOutputApi.reveal).toHaveBeenCalledWith('sample-video');
  });

  it('reports unavailable preload API', async () => {
    await expect(renderClient.status('sample-video')).rejects.toThrow('Render Output未接続');
  });
});

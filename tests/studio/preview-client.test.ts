import {afterEach, describe, expect, it, vi} from 'vitest';
import {previewClient} from '../../src/studio/renderer/preview-client';
import type {PreviewApi} from '../../src/studio/shared/preview';

describe('preview client', () => {
  afterEach(() => delete globalThis.previewApi);

  it('delegates check and load', async () => {
    const snapshot = {source: {videoId: 'sample', scriptModifiedAt: 1, manifestModifiedAt: 2, timelineModifiedAt: 3}, readiness: {ready: true, missing: [], stale: [], requiredOperations: []}};
    const api = {
      check: vi.fn().mockResolvedValue(snapshot),
      load: vi.fn().mockResolvedValue({...snapshot, inputProps: {}}),
    } as unknown as PreviewApi;
    globalThis.previewApi = api;
    await expect(previewClient.check('sample')).resolves.toBe(snapshot);
    await previewClient.load('sample');
    expect(api.load).toHaveBeenCalledWith('sample');
  });

  it('reports unavailable IPC', async () => {
    expect(() => previewClient.check('sample')).toThrow('Preview未接続');
  });
});

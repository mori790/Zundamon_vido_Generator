import {afterEach, describe, expect, it, vi} from 'vitest';
import {commandClient} from '../../src/studio/renderer/command-client';
import type {CommandApi} from '../../src/studio/shared/command';

describe('command client', () => {
  afterEach(() => {
    delete globalThis.commandApi;
  });

  it('reports an unavailable command runner', async () => {
    await expect(commandClient.start({videoId: 'sample-video', command: 'validate'}))
      .rejects.toThrow('Command Runner未接続');
  });

  it('delegates to the preload API', async () => {
    const operation = {
      id: 'op',
      videoId: 'sample-video',
      command: 'validate' as const,
      phase: 'command' as const,
      status: 'running' as const,
      startedAt: '2026-07-26T00:00:00.000Z',
    };
    const start = vi.fn().mockResolvedValue(operation);
    globalThis.commandApi = {
      start,
      stop: vi.fn(),
      clearLogs: vi.fn(),
      snapshot: vi.fn(),
      onOperation: vi.fn(),
      onLog: vi.fn(),
    } as CommandApi;

    await expect(commandClient.start({videoId: 'sample-video', command: 'validate'})).resolves.toBe(operation);
    expect(start).toHaveBeenCalledWith({videoId: 'sample-video', command: 'validate'});
  });
});


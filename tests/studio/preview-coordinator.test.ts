import {describe, expect, it, vi} from 'vitest';
import {PreviewCoordinator} from '../../src/studio/renderer/preview-coordinator';
import type {Operation} from '../../src/studio/shared/command';
import type {PreviewApi, PreviewSnapshot} from '../../src/studio/shared/preview';

const ready: PreviewSnapshot = {
  source: {
    videoId: 'sample-video',
    scriptModifiedAt: 1,
    manifestModifiedAt: 2,
    timelineModifiedAt: 3,
  },
  readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
};

const succeeded = (command: 'voice' | 'timeline'): Operation => ({
  id: command,
  videoId: 'sample-video',
  command,
  phase: 'command',
  status: 'succeeded',
  startedAt: '',
});

describe('preview coordinator', () => {
  it('generates voice then timeline and loads the refreshed snapshot', async () => {
    const stale: PreviewSnapshot = {
      ...ready,
      readiness: {
        ready: false,
        missing: ['manifest', 'timeline'],
        stale: [],
        requiredOperations: ['voice', 'timeline'],
      },
    };
    const api = {
      check: vi.fn().mockResolvedValueOnce(stale).mockResolvedValueOnce(ready),
      load: vi.fn().mockResolvedValue({...ready, inputProps: {}}),
    } as PreviewApi;
    const runCommand = vi.fn(async (command: 'voice' | 'timeline') => succeeded(command));
    const coordinator = new PreviewCoordinator('sample-video', api, runCommand);
    await coordinator.refresh();
    expect(runCommand.mock.calls.map(([command]) => command)).toEqual(['voice', 'timeline']);
    expect(coordinator.getState().status).toBe('ready');
  });

  it('coalesces events and ignores results after cleanup', async () => {
    const releases: Array<(snapshot: PreviewSnapshot) => void> = [];
    const api = {
      check: vi.fn(() => new Promise<PreviewSnapshot>((resolve) => { releases.push(resolve); })),
      load: vi.fn().mockResolvedValue({...ready, inputProps: {}}),
    } as PreviewApi;
    const coordinator = new PreviewCoordinator('sample-video', api, vi.fn());
    const first = coordinator.refresh();
    coordinator.refresh();
    releases[0](ready);
    await vi.waitFor(() => expect(api.check).toHaveBeenCalledTimes(2));
    releases[1](ready);
    await first;
    expect(api.check).toHaveBeenCalledTimes(2);

    coordinator.dispose();
    await coordinator.refresh();
    expect(coordinator.getState().status).toBe('ready');
  });

  it('exposes command failures as text errors', async () => {
    const stale: PreviewSnapshot = {
      ...ready,
      readiness: {ready: false, missing: ['timeline'], stale: [], requiredOperations: ['timeline']},
    };
    const api = {check: vi.fn().mockResolvedValue(stale), load: vi.fn()} as unknown as PreviewApi;
    const coordinator = new PreviewCoordinator(
      'sample-video',
      api,
      vi.fn().mockResolvedValue({...succeeded('timeline'), status: 'failed', error: 'boom'}),
    );
    await coordinator.refresh();
    expect(coordinator.getState()).toMatchObject({status: 'error', message: 'boom'});
  });
});

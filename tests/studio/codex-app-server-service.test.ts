import os from 'node:os';
import path from 'node:path';
import {mkdtemp, rm} from 'node:fs/promises';
import {afterEach, describe, expect, it} from 'vitest';
import {CodexAppServerService} from '../../src/studio/main/codex-app-server-service';
import type {CodexEvent} from '../../src/studio/shared/codex-app-server';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, {recursive: true})));
});

describe('CodexAppServerService', () => {
  it('correlates a fake process turn and settles approval exactly once', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'u9-codex-'));
    directories.push(root);
    const service = new CodexAppServerService(root, {
      command: process.execPath,
      args: [path.resolve('tests/fixtures/fake-codex-app-server.mjs')],
    });
    const events: CodexEvent[] = [];
    service.onEvent((event) => events.push(event));
    await expect(service.connect('demo')).resolves.toEqual({status: 'connected'});
    await service.send({videoId: 'demo', message: 'safe'});
    await waitFor(() => events.some((event) => event.type === 'approval'));
    const approval = events.find((event) => event.type === 'approval');
    if (!approval || approval.type !== 'approval') throw new Error('Missing approval.');
    await service.respondApproval(approval.approval.id, false);
    await service.respondApproval(approval.approval.id, true);
    await waitFor(() => events.some((event) => event.type === 'turn-completed'));
    expect(events).toContainEqual({type: 'delta', text: 'FAKE_OK'});
    await service.disconnect();
  });

  it('opens after bounded process failures and permits explicit half-open retry', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'u9-codex-exit-'));
    directories.push(root);
    const service = new CodexAppServerService(root, {
      command: process.execPath,
      args: [path.resolve('tests/fixtures/fake-codex-app-server.mjs'), '--exit'],
    });
    await expect(service.connect('demo')).resolves.toMatchObject({status: 'error'});
    await expect(service.reconnect('demo')).resolves.toMatchObject({status: 'error'});
    await service.disconnect();
  }, 15_000);

  it('denies an unanswered approval when its timeout expires', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'u9-codex-timeout-'));
    directories.push(root);
    const service = new CodexAppServerService(root, {
      command: process.execPath,
      args: [path.resolve('tests/fixtures/fake-codex-app-server.mjs')],
    }, 20);
    const events: CodexEvent[] = [];
    service.onEvent((event) => events.push(event));
    await service.connect('demo');
    await service.send({videoId: 'demo', message: 'safe'});
    await waitFor(() => events.some((event) => event.type === 'turn-completed'));
    expect(events.some((event) => event.type === 'approval')).toBe(true);
    await service.disconnect();
  });
});

async function waitFor(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Timed out waiting for fake App Server event.');
}

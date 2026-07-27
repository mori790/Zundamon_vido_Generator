import {mkdtemp, readFile, realpath, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {WorkspaceRootService} from '../../src/studio/main/workspace-root-service';

const roots: string[] = [];
async function temporary(name: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), `${name}-`));
  roots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, {recursive: true, force: true})));
});

describe('WorkspaceRootService', () => {
  it('creates the required structure and restores an atomic reference', async () => {
    const userData = await temporary('u10-user-data');
    const selected = await temporary('u10-workspace');
    const service = new WorkspaceRootService({
      userData,
      forbiddenRoots: [userData],
      chooseRoot: async () => selected,
    });
    const canonical = await realpath(selected);
    expect(await service.select()).toEqual({status: 'ready', root: canonical});
    expect(JSON.parse(await readFile(path.join(userData, 'workspace.json'), 'utf8'))).toEqual({
      schemaVersion: 1,
      root: canonical,
    });
    await expect(new WorkspaceRootService({
      userData,
      forbiddenRoots: [userData],
      chooseRoot: async () => null,
    }).get()).resolves.toEqual({status: 'ready', root: canonical});
  });

  it('rejects an application-managed folder', async () => {
    const userData = await temporary('u10-forbidden');
    const service = new WorkspaceRootService({
      userData,
      forbiddenRoots: [userData],
      chooseRoot: async () => userData,
    });
    expect((await service.select()).status).toBe('invalid');
  });
});

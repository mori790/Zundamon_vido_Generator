import {randomUUID} from 'node:crypto';
import {access, mkdir, readFile, realpath, rename, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {constants} from 'node:fs';
import {
  parseWorkspaceReference,
  type ProjectRootState,
  type WorkspaceReference,
} from '../shared/workspace';

const requiredDirectories = ['input', 'public', 'generated', 'output'] as const;

export type WorkspaceRootServiceOptions = {
  userData: string;
  forbiddenRoots: string[];
  chooseRoot(): Promise<string | null>;
  defaultRoot?: string;
};

export class WorkspaceRootService {
  private readonly settingsPath: string;
  private current: string | null = null;

  constructor(private readonly options: WorkspaceRootServiceOptions) {
    this.settingsPath = path.join(options.userData, 'workspace.json');
  }

  async get(): Promise<ProjectRootState> {
    if (this.current) return this.validate(this.current);
    try {
      const reference = parseWorkspaceReference(JSON.parse(await readFile(this.settingsPath, 'utf8')));
      return this.validate(reference.root);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        return {status: 'invalid', reason: '保存済みWorkspace設定が壊れています。'};
      }
    }
    if (this.options.defaultRoot) return this.validate(this.options.defaultRoot);
    return {status: 'unconfigured'};
  }

  async select(): Promise<ProjectRootState> {
    const selected = await this.options.chooseRoot();
    if (!selected) return this.get();
    const state = await this.validate(selected, true);
    if (state.status === 'ready') {
      await this.save({schemaVersion: 1, root: state.root!});
    }
    return state;
  }

  async clear(): Promise<void> {
    this.current = null;
    await rm(this.settingsPath, {force: true});
  }

  async requireRoot(): Promise<string> {
    const state = await this.get();
    if (state.status !== 'ready' || !state.root) {
      throw new Error('Workspaceを選択してください。');
    }
    return state.root;
  }

  private async validate(candidate: string, create = false): Promise<ProjectRootState> {
    const created: string[] = [];
    try {
      const root = await realpath(candidate);
      const details = await stat(root);
      if (!details.isDirectory()) return {status: 'invalid', reason: 'Folderではありません。'};
      await access(root, constants.R_OK | constants.W_OK);
      for (const forbidden of this.options.forbiddenRoots) {
        const canonical = await realpath(forbidden).catch(() => path.resolve(forbidden));
        if (root === canonical || root.startsWith(`${canonical}${path.sep}`)) {
          return {status: 'invalid', reason: 'Application管理folderはWorkspaceにできません。'};
        }
      }
      for (const directory of requiredDirectories) {
        const target = path.join(root, directory);
        try {
          if (!(await stat(target)).isDirectory()) {
            throw new Error(`${directory}がdirectoryではありません。`);
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || !create) throw error;
          await mkdir(target);
          created.push(target);
        }
      }
      this.current = root;
      return {status: 'ready', root};
    } catch (error) {
      await Promise.all(created.reverse().map((target) => rm(target, {recursive: true, force: true})));
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') return {status: 'missing', reason: 'Workspaceが見つかりません。'};
      if (code === 'EACCES' || code === 'EPERM') return {status: 'denied', reason: 'Workspaceへの権限がありません。'};
      return {status: 'invalid', reason: error instanceof Error ? error.message : 'Workspaceが不正です。'};
    }
  }

  private async save(reference: WorkspaceReference): Promise<void> {
    await mkdir(this.options.userData, {recursive: true, mode: 0o700});
    const temporary = `${this.settingsPath}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(reference)}\n`, {encoding: 'utf8', mode: 0o600});
    await rename(temporary, this.settingsPath);
  }
}

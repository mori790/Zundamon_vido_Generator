import path from 'node:path';
import {env} from './env';

export let workspaceRoot = process.cwd();

export {env};

export let directories = {
  input: path.join(workspaceRoot, 'input'),
  public: path.join(workspaceRoot, 'public'),
  generated: path.join(workspaceRoot, 'generated'),
  manifests: path.join(workspaceRoot, 'generated', 'manifests'),
  timelines: path.join(workspaceRoot, 'generated', 'timelines'),
  output: path.join(workspaceRoot, env.outputDir),
};

export function setWorkspaceRoot(root: string): void {
  workspaceRoot = path.resolve(root);
  directories = {
    input: path.join(workspaceRoot, 'input'),
    public: path.join(workspaceRoot, 'public'),
    generated: path.join(workspaceRoot, 'generated'),
    manifests: path.join(workspaceRoot, 'generated', 'manifests'),
    timelines: path.join(workspaceRoot, 'generated', 'timelines'),
    output: path.join(workspaceRoot, env.outputDir),
  };
}

export const sampleVideoIds = new Set(['sample-video']);

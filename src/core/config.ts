import path from 'node:path';
import {env} from './env';

export const workspaceRoot = process.cwd();

export {env};

export const directories = {
  input: path.join(workspaceRoot, 'input'),
  public: path.join(workspaceRoot, 'public'),
  generated: path.join(workspaceRoot, 'generated'),
  manifests: path.join(workspaceRoot, 'generated', 'manifests'),
  timelines: path.join(workspaceRoot, 'generated', 'timelines'),
  output: path.join(workspaceRoot, env.outputDir),
};

export const sampleVideoIds = new Set(['sample-video']);

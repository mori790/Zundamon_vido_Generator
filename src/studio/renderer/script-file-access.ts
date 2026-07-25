import type {ScriptFileAccess} from '../shared/script-apply';

type NodeRequire = (id: string) => unknown;

declare global {
  interface Window {
    require?: NodeRequire;
  }
}

export function createRendererScriptFileAccess(): ScriptFileAccess {
  const require = window.require;
  if (!require) {
    throw new Error('Local file access is unavailable in this renderer.');
  }

  const fs = require('node:fs/promises') as typeof import('node:fs/promises');
  return {
    async readFile(path) {
      return fs.readFile(path, 'utf8');
    },
    async writeFile(path, data) {
      await fs.writeFile(path, data);
    },
  };
}

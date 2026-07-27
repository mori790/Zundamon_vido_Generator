import type {ScriptFileAccess} from '../shared/script-apply';

export function createRendererScriptFileAccess(): ScriptFileAccess {
  const api = globalThis.localFileApi;
  if (!api) {
    throw new Error('Local file access is unavailable in this renderer.');
  }
  return {
    async readFile(path) {
      const source = await api.workspace.readScript(path.replace(/^input\//, ''));
      if (source === null) throw Object.assign(new Error('Not found'), {code: 'ENOENT'});
      return source;
    },
    async writeFile(path, data) {
      await api.workspace.writeScript(path.replace(/^input\//, ''), data);
    },
  };
}

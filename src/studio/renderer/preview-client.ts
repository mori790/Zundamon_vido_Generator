import type {PreviewApi, PreviewLoadResult, PreviewSnapshot} from '../shared/preview';

declare global {
  var previewApi: PreviewApi | undefined;
}

function api(): PreviewApi {
  if (!globalThis.previewApi) throw new Error('Preview未接続');
  return globalThis.previewApi;
}

export const previewClient = {
  check(videoId: string): Promise<PreviewSnapshot> {
    return api().check(videoId);
  },
  load(videoId: string): Promise<PreviewLoadResult> {
    return api().load(videoId);
  },
};

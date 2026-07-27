import type {RenderOutputApi} from '../shared/render';

declare global {
  var renderOutputApi: RenderOutputApi | undefined;
}

function api(): RenderOutputApi {
  if (!globalThis.renderOutputApi) throw new Error('Render Output未接続');
  return globalThis.renderOutputApi;
}

export const renderClient: RenderOutputApi = {
  async status(videoId) {
    return api().status(videoId);
  },
  async confirmOverwrite(videoId) {
    return api().confirmOverwrite(videoId);
  },
  async reveal(videoId) {
    return api().reveal(videoId);
  },
};

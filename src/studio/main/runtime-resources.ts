import path from 'node:path';
import type {App} from 'electron';

export function resolveRuntimeResources(
  app: Pick<App, 'getAppPath' | 'isPackaged'>,
  resourcesPath = process.resourcesPath,
) {
  const applicationRoot = app.getAppPath();
  return {
    applicationRoot,
    rendererHtml: path.join(applicationRoot, 'dist-studio', 'studio.html'),
    preload: path.join(applicationRoot, 'dist-studio', 'preload.cjs'),
    cliRoot: app.isPackaged ? path.join(resourcesPath, 'dist-cli') : applicationRoot,
  };
}

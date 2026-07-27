import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs/promises';
import {app, BrowserWindow, ipcMain} from 'electron';
import {createServer, type ViteDevServer} from 'vite';
import {createLocalFileService} from '../../src/studio/main/local-file-service';

let server: ViteDevServer | undefined;
let temporaryDirectory: string | undefined;

async function run(): Promise<void> {
  const timeout = setTimeout(() => {
    console.error('Electron E2E timed out.');
    app.exit(1);
  }, 30000);
  temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'u5-electron-e2e-'));
  const assetPath = path.join(temporaryDirectory, 'e2e.png');
  await fs.writeFile(
    assetPath,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
  );
  await fs.mkdir(path.join(temporaryDirectory, 'input'));
  const localFiles = createLocalFileService(temporaryDirectory, assetPath);
  ipcMain.handle('local-file:list-input', () => localFiles.workspace.listInput());
  ipcMain.handle('local-file:read-script', (_event, fileName: string) => localFiles.workspace.readScript(fileName));
  ipcMain.handle('local-file:write-script', (_event, fileName: string, data: string) =>
    localFiles.workspace.writeScript(fileName, data));
  ipcMain.handle('local-file:read-chat', (_event, videoId: string) => localFiles.chat.read(videoId));
  ipcMain.handle('local-file:write-chat', (_event, videoId: string, data: string) => localFiles.chat.write(videoId, data));
  ipcMain.handle('local-file:select-asset', () => localFiles.asset.select());
  ipcMain.handle('local-file:copy-asset', (_event, videoId: string, token: string, overwrite: boolean) =>
    localFiles.asset.copy(videoId, token, overwrite));
  ipcMain.handle('local-file:asset-exists', (_event, publicPath: string) => localFiles.asset.exists(publicPath));
  ipcMain.handle('local-file:trash-asset', (_event, publicPath: string) => localFiles.asset.trash(publicPath));
  ipcMain.handle('command:snapshot', () => ({operation: null, logs: []}));
  ipcMain.handle('preview:check', () => ({status: 'missing', missing: []}));
  ipcMain.handle('preview:load', () => ({status: 'missing', missing: []}));
  ipcMain.handle('render-output:status', () => ({status: 'missing'}));
  ipcMain.handle('codex:connect', () => ({status: 'connected'}));
  ipcMain.handle('codex:interrupt', () => undefined);
  ipcMain.handle('codex:disconnect', () => undefined);
  server = await createServer({
    configFile: path.resolve('vite.studio.config.ts'),
    server: {host: '127.0.0.1', port: 0},
  });
  await server.listen();
  const baseUrl = server.resolvedUrls?.local[0];
  if (!baseUrl) {
    throw new Error('Vite E2E server did not expose a local URL.');
  }

  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.resolve('dist-studio/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  await window.loadURL(new URL('studio.html', baseUrl).toString());
  console.log('E2E_PAGE_LOADED');
  await waitFor(window, '[data-testid="start-screen-new-video-id-input"]');
  await window.webContents.executeJavaScript(`
    (() => {
      const input = document.querySelector('[data-testid="start-screen-new-video-id-input"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'u5-e2e');
      input.dispatchEvent(new Event('input', {bubbles: true}));
      document.querySelector('[data-testid="start-screen-open-button"]').click();
    })()
  `);
  await waitFor(window, '[data-testid="script-review-create-draft-button"]');
  console.log('E2E_WORKSPACE_OPENED');
  await window.webContents.executeJavaScript(
    `document.querySelector('[data-testid="script-review-create-draft-button"]').click()`,
  );
  await waitFor(window, '[data-testid="scene-image-select-button"]');
  console.log('E2E_DRAFT_CREATED');
  await window.webContents.executeJavaScript(
    `document.querySelector('[data-testid="scene-image-select-button"]').click()`,
  );
  await waitFor(
    window,
    '[data-testid="scene-image-path"], [data-testid="asset-operation-error"]',
  );
  const renderedError = await window.webContents.executeJavaScript(
    `document.querySelector('[data-testid="asset-operation-error"]')?.textContent ?? ''`,
  );
  if (renderedError) {
    throw new Error(`Asset operation failed: ${renderedError}`);
  }
  const publicPath = await window.webContents.executeJavaScript(
    `document.querySelector('[data-testid="scene-image-path"]').textContent`,
  );
  if (publicPath !== '/visuals/u5-e2e/e2e.png') {
    throw new Error(`Unexpected Scene image path: ${publicPath}`);
  }
  console.log('U5_ELECTRON_E2E_OK');
  clearTimeout(timeout);
  window.destroy();
}

async function waitFor(window: BrowserWindow, selector: string, timeoutMs = 10000): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await window.webContents.executeJavaScript(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${selector}`);
}

async function cleanup(): Promise<void> {
  await server?.close();
  if (temporaryDirectory) {
    await fs.rm(temporaryDirectory, {recursive: true});
  }
}

app.whenReady()
  .then(run)
  .then(cleanup)
  .then(() => app.quit())
  .catch(async (error) => {
    console.error(error);
    await cleanup();
    app.exit(1);
  });

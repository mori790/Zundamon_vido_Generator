import path from 'node:path';
import os from 'node:os';
import * as fs from 'node:fs/promises';
import {app, BrowserWindow} from 'electron';
import {createServer, type ViteDevServer} from 'vite';

let server: ViteDevServer | undefined;
let temporaryDirectory: string | undefined;

async function run(): Promise<void> {
  temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'u5-electron-e2e-'));
  const assetPath = path.join(temporaryDirectory, 'e2e.png');
  await fs.writeFile(
    assetPath,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
  );
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
      additionalArguments: [
        `--studio-e2e-asset=${assetPath}`,
        `--studio-e2e-workspace=${temporaryDirectory}`,
      ],
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  await window.loadURL(new URL('studio.html', baseUrl).toString());
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
  await window.webContents.executeJavaScript(
    `document.querySelector('[data-testid="script-review-create-draft-button"]').click()`,
  );
  await waitFor(window, '[data-testid="scene-image-select-button"]');
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

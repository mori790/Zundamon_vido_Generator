import path from 'node:path';
import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron';
import {CommandRunner} from './command-runner';
import {checkPreview, loadPreview} from './preview-data-service';
import {createRenderOutputService} from './render-output-service';
import type {StartCommandRequest} from '../shared/command';

const isDev = process.env.NODE_ENV !== 'production';
const renderOutputService = createRenderOutputService({
  async confirm(outputPath) {
    const result = await dialog.showMessageBox({
      type: 'warning',
      buttons: ['上書きしてRender', 'キャンセル'],
      cancelId: 1,
      defaultId: 1,
      title: '既存の動画を上書きしますか？',
      message: '既存のRender出力を上書きします。',
      detail: outputPath,
    });
    return result.response === 0;
  },
  reveal: (outputPath) => shell.showItemInFolder(outputPath),
});
const runner = new CommandRunner(process.cwd(), {
  operation(operation) {
    BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('command:operation', operation));
  },
  log(entry) {
    BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('command:log', entry));
  },
}, undefined, (videoId) => renderOutputService.verify(videoId));

ipcMain.handle('command:start', (_event, request: StartCommandRequest) => runner.start(request));
ipcMain.handle('command:stop', (_event, operationId: string) => runner.stop(operationId));
ipcMain.handle('command:clear-logs', (_event, operationId: string) => runner.clearLogs(operationId));
ipcMain.handle('command:snapshot', () => runner.snapshot());
ipcMain.handle('preview:check', (_event, videoId: string) => checkPreview(videoId));
ipcMain.handle('preview:load', (_event, videoId: string) => loadPreview(videoId));
ipcMain.handle('render-output:status', (_event, videoId: string) => renderOutputService.status(videoId));
ipcMain.handle('render-output:confirm-overwrite', (_event, videoId: string) =>
  renderOutputService.confirmOverwrite(videoId));
ipcMain.handle('render-output:reveal', (_event, videoId: string) => renderOutputService.reveal(videoId));

async function createMainWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Zundamon Studio',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(process.cwd(), 'src/studio/main/preload.ts'),
    },
  });

  if (isDev) {
    await window.loadURL(process.env.STUDIO_DEV_SERVER_URL ?? 'http://localhost:5173/studio.html');
    return;
  }

  await window.loadFile(path.join(process.cwd(), 'dist-studio/studio.html'));
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createMainWindow();
  }
});

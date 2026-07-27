import path from 'node:path';
import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron';
import {CommandRunner} from './command-runner';
import {checkPreview, loadPreview} from './preview-data-service';
import {createRenderOutputService} from './render-output-service';
import {createLocalFileService} from './local-file-service';
import {CodexAppServerService} from './codex-app-server-service';
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
const localFiles = createLocalFileService();
const codex = new CodexAppServerService();
codex.onEvent((event) => {
  BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('codex:event', event));
});

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
ipcMain.handle('codex:connect', (_event, videoId: string) => codex.connect(videoId));
ipcMain.handle('codex:send', (_event, input) => codex.send(input));
ipcMain.handle('codex:interrupt', () => codex.interrupt());
ipcMain.handle('codex:reconnect', (_event, videoId: string) => codex.reconnect(videoId));
ipcMain.handle('codex:start-new-thread', (_event, videoId: string) => codex.startNewThread(videoId));
ipcMain.handle('codex:respond-approval', (_event, id: string, approved: boolean) =>
  codex.respondApproval(id, approved));
ipcMain.handle('codex:disconnect', () => codex.disconnect());

async function createMainWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Zundamon Studio',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(process.cwd(), 'dist-studio/preload.cjs'),
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
  void codex.disconnect();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createMainWindow();
  }
});

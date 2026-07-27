import path from 'node:path';
import {app, BrowserWindow, dialog, ipcMain, shell} from 'electron';
import {CommandRunner} from './command-runner';
import {checkPreview, loadPreview} from './preview-data-service';
import {createRenderOutputService} from './render-output-service';
import {createLocalFileService} from './local-file-service';
import {CodexAppServerService} from './codex-app-server-service';
import type {StartCommandRequest} from '../shared/command';
import {WorkspaceRootService} from './workspace-root-service';
import {createDependencyDiagnosisService} from './dependency-diagnosis-service';
import {resolveRuntimeResources} from './runtime-resources';
import {setWorkspaceRoot} from '../../core/config';

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const resources = resolveRuntimeResources(app);
const workspaceRoots = new WorkspaceRootService({
  userData: app.getPath('userData'),
  forbiddenRoots: [app.getPath('userData'), resources.applicationRoot],
  defaultRoot: app.isPackaged ? undefined : process.cwd(),
  async chooseRoot() {
    const result = await dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory']});
    return result.canceled ? null : result.filePaths[0] ?? null;
  },
});
const dependencies = createDependencyDiagnosisService();
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
let runnerRoot = process.cwd();
let runner = createRunner(runnerRoot);
function createRunner(root: string): CommandRunner {
  return new CommandRunner(root, {
  operation(operation) {
    BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('command:operation', operation));
  },
  log(entry) {
    BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('command:log', entry));
  },
  }, undefined, (videoId) => renderOutputService.verify(videoId), app.isPackaged
    ? (script, videoId) => ({
        command: process.execPath,
        args: [path.join(resources.cliRoot, `${script}.cjs`), videoId],
        env: {
          ELECTRON_RUN_AS_NODE: '1',
          NODE_PATH: path.join(resources.applicationRoot, 'node_modules'),
          ZUNDAMON_REMOTION_BUNDLE: path.join(process.resourcesPath, 'dist-remotion'),
          ZUNDAMON_REMOTION_BINARIES: path.join(
            `${resources.applicationRoot}.unpacked`,
            'node_modules',
            '@remotion',
            'compositor-darwin-arm64',
          ),
        },
      })
    : undefined);
}
async function useWorkspaceRoot(): Promise<string> {
  const root = await workspaceRoots.requireRoot();
  setWorkspaceRoot(root);
  if (runnerRoot !== root) {
    runnerRoot = root;
    runner = createRunner(root);
  }
  return root;
}
const codex = new CodexAppServerService();
codex.onEvent((event) => {
  BrowserWindow.getAllWindows().forEach((window) => window.webContents.send('codex:event', event));
});

ipcMain.handle('workspace:get', async () => {
  const state = await workspaceRoots.get();
  if (state.status === 'ready' && state.root) setWorkspaceRoot(state.root);
  return state;
});
ipcMain.handle('workspace:select', async () => {
  const state = await workspaceRoots.select();
  if (state.status === 'ready' && state.root) setWorkspaceRoot(state.root);
  return state;
});
ipcMain.handle('workspace:clear', () => workspaceRoots.clear());
ipcMain.handle('dependency:check-all', () => dependencies.checkAll());
ipcMain.handle('dependency:check', (_event, name) => dependencies.check(name));
ipcMain.handle('command:start', async (_event, request: StartCommandRequest) => {
  await useWorkspaceRoot();
  if (request.command === 'voice') {
    const status = await dependencies.check('voicevox');
    if (status.status !== 'ready') throw new Error('VOICEVOXを起動し、接続を再確認してください。');
  }
  return runner.start(request);
});
ipcMain.handle('command:stop', (_event, operationId: string) => runner.stop(operationId));
ipcMain.handle('command:clear-logs', (_event, operationId: string) => runner.clearLogs(operationId));
ipcMain.handle('command:snapshot', () => runner.snapshot());
ipcMain.handle('preview:check', async (_event, videoId: string) => {
  await useWorkspaceRoot();
  return checkPreview(videoId);
});
ipcMain.handle('preview:load', async (_event, videoId: string) => {
  await useWorkspaceRoot();
  return loadPreview(videoId);
});
ipcMain.handle('render-output:status', (_event, videoId: string) => renderOutputService.status(videoId));
ipcMain.handle('render-output:confirm-overwrite', (_event, videoId: string) =>
  renderOutputService.confirmOverwrite(videoId));
ipcMain.handle('render-output:reveal', (_event, videoId: string) => renderOutputService.reveal(videoId));
async function localFiles() {
  return createLocalFileService(await useWorkspaceRoot());
}
ipcMain.handle('local-file:list-input', async () => (await localFiles()).workspace.listInput());
ipcMain.handle('local-file:read-script', async (_event, fileName: string) =>
  (await localFiles()).workspace.readScript(fileName));
ipcMain.handle('local-file:write-script', async (_event, fileName: string, data: string) =>
  (await localFiles()).workspace.writeScript(fileName, data));
ipcMain.handle('local-file:read-chat', async (_event, videoId: string) => (await localFiles()).chat.read(videoId));
ipcMain.handle('local-file:write-chat', async (_event, videoId: string, data: string) =>
  (await localFiles()).chat.write(videoId, data));
ipcMain.handle('local-file:select-asset', async () => (await localFiles()).asset.select());
ipcMain.handle('local-file:copy-asset', async (_event, videoId: string, token: string, overwrite: boolean) =>
  (await localFiles()).asset.copy(videoId, token, overwrite));
ipcMain.handle('local-file:asset-exists', async (_event, publicPath: string) =>
  (await localFiles()).asset.exists(publicPath));
ipcMain.handle('local-file:trash-asset', async (_event, publicPath: string) =>
  (await localFiles()).asset.trash(publicPath));
ipcMain.handle('codex:connect', async (_event, videoId: string) => {
  const status = await dependencies.check('codex');
  if (status.status !== 'ready') throw new Error('Codex CLIのinstall、version、login状態を確認してください。');
  return codex.connect(videoId);
});
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
      preload: resources.preload,
    },
  });

  if (isDev) {
    await window.loadURL(process.env.STUDIO_DEV_SERVER_URL ?? 'http://localhost:5173/studio.html');
    return;
  }

  await window.loadFile(resources.rendererHtml);
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

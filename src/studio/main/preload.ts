import {contextBridge, ipcRenderer} from 'electron';
import type {CommandApi, LogEntry, Operation, StartCommandRequest} from '../shared/command';
import type {PreviewApi} from '../shared/preview';
import type {RenderOutputApi} from '../shared/render';
import type {DependencyApi} from '../shared/desktop';
import type {WorkspaceRootApi} from '../shared/workspace';
import type {TextInputFileApi} from '../shared/local-file';
import type {SceneSegmentationApi} from '../shared/scene-segmentation';

const commandApi: CommandApi = {
  start: (request: StartCommandRequest) => ipcRenderer.invoke('command:start', request),
  stop: (operationId: string) => ipcRenderer.invoke('command:stop', operationId),
  clearLogs: (operationId: string) => ipcRenderer.invoke('command:clear-logs', operationId),
  snapshot: () => ipcRenderer.invoke('command:snapshot'),
  onOperation(listener: (operation: Operation) => void) {
    const handler = (_event: Electron.IpcRendererEvent, operation: Operation) => listener(operation);
    ipcRenderer.on('command:operation', handler);
    return () => ipcRenderer.removeListener('command:operation', handler);
  },
  onLog(listener: (entry: LogEntry) => void) {
    const handler = (_event: Electron.IpcRendererEvent, entry: LogEntry) => listener(entry);
    ipcRenderer.on('command:log', handler);
    return () => ipcRenderer.removeListener('command:log', handler);
  },
};

contextBridge.exposeInMainWorld('commandApi', commandApi);

contextBridge.exposeInMainWorld('workspaceApi', {
  get: () => ipcRenderer.invoke('workspace:get'),
  select: () => ipcRenderer.invoke('workspace:select'),
  clear: () => ipcRenderer.invoke('workspace:clear'),
} satisfies WorkspaceRootApi);

contextBridge.exposeInMainWorld('dependencyApi', {
  checkAll: () => ipcRenderer.invoke('dependency:check-all'),
  check: (name) => ipcRenderer.invoke('dependency:check', name),
} satisfies DependencyApi);

const previewApi: PreviewApi = {
  check: (videoId: string) => ipcRenderer.invoke('preview:check', videoId),
  load: (videoId: string) => ipcRenderer.invoke('preview:load', videoId),
};

contextBridge.exposeInMainWorld('previewApi', previewApi);

contextBridge.exposeInMainWorld('renderOutputApi', {
  status: (videoId: string) => ipcRenderer.invoke('render-output:status', videoId),
  confirmOverwrite: (videoId: string) => ipcRenderer.invoke('render-output:confirm-overwrite', videoId),
  reveal: (videoId: string) => ipcRenderer.invoke('render-output:reveal', videoId),
} satisfies RenderOutputApi);

contextBridge.exposeInMainWorld('localFileApi', {
  workspace: {
    listInput: () => ipcRenderer.invoke('local-file:list-input'),
    readScript: (fileName: string) => ipcRenderer.invoke('local-file:read-script', fileName),
    writeScript: (fileName: string, data: string) => ipcRenderer.invoke('local-file:write-script', fileName, data),
  },
  chat: {
    read: (videoId: string) => ipcRenderer.invoke('local-file:read-chat', videoId),
    write: (videoId: string, data: string) => ipcRenderer.invoke('local-file:write-chat', videoId, data),
  },
  asset: {
    select: () => ipcRenderer.invoke('local-file:select-asset'),
    copy: (videoId: string, token: string, overwrite: boolean) =>
      ipcRenderer.invoke('local-file:copy-asset', videoId, token, overwrite),
    exists: (publicPath: string) => ipcRenderer.invoke('local-file:asset-exists', publicPath),
    trash: (publicPath: string) => ipcRenderer.invoke('local-file:trash-asset', publicPath),
  },
  draft: {
    read: (videoId: string) => ipcRenderer.invoke('local-file:read-draft', videoId),
    write: (videoId: string, data: string) => ipcRenderer.invoke('local-file:write-draft', videoId, data),
  },
});

contextBridge.exposeInMainWorld('textInputFileApi', {
  openFileDialog: () => ipcRenderer.invoke('text-input:open-file-dialog'),
  readTextFile: (filePath: string) => ipcRenderer.invoke('text-input:read-file', filePath),
} satisfies TextInputFileApi);

contextBridge.exposeInMainWorld('sceneSegmentationApi', {
  segment: (draftText: string, videoId: string) => ipcRenderer.invoke('scene-segmentation:segment', draftText, videoId),
} satisfies SceneSegmentationApi);

contextBridge.exposeInMainWorld('codexApi', {
  connect: (videoId: string) => ipcRenderer.invoke('codex:connect', videoId),
  send: (input: unknown) => ipcRenderer.invoke('codex:send', input),
  interrupt: () => ipcRenderer.invoke('codex:interrupt'),
  reconnect: (videoId: string) => ipcRenderer.invoke('codex:reconnect', videoId),
  startNewThread: (videoId: string) => ipcRenderer.invoke('codex:start-new-thread', videoId),
  respondApproval: (id: string, approved: boolean) => ipcRenderer.invoke('codex:respond-approval', id, approved),
  disconnect: () => ipcRenderer.invoke('codex:disconnect'),
  onEvent(listener: (event: unknown) => void) {
    const handler = (_event: Electron.IpcRendererEvent, event: unknown) => listener(event);
    ipcRenderer.on('codex:event', handler);
    return () => ipcRenderer.removeListener('codex:event', handler);
  },
});

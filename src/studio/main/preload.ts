import {ipcRenderer} from 'electron';
import type {CommandApi, LogEntry, Operation, StartCommandRequest} from '../shared/command';
import type {PreviewApi} from '../shared/preview';
import type {RenderOutputApi} from '../shared/render';

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

globalThis.commandApi = commandApi;

const previewApi: PreviewApi = {
  check: (videoId: string) => ipcRenderer.invoke('preview:check', videoId),
  load: (videoId: string) => ipcRenderer.invoke('preview:load', videoId),
};

globalThis.previewApi = previewApi;

globalThis.renderOutputApi = {
  status: (videoId: string) => ipcRenderer.invoke('render-output:status', videoId),
  confirmOverwrite: (videoId: string) => ipcRenderer.invoke('render-output:confirm-overwrite', videoId),
  reveal: (videoId: string) => ipcRenderer.invoke('render-output:reveal', videoId),
} satisfies RenderOutputApi;

import type {VideoScript} from '../../types/video';
import {
  createEmptyDraftWorkspace,
  createExistingWorkspace,
  createFileSystemError,
  createInvalidScriptError,
  normalizeVideoId,
  validateVideoId,
  type VideoProjectSummary,
  type WorkspaceOpenResult,
} from '../shared/workspace';

type FileSystemAccess = {
  readDirectory(path: string): Promise<Array<{name: string; kind: 'file' | 'directory'}>>;
  readFile(path: string): Promise<string>;
  stat(path: string): Promise<{mtime?: Date}>;
};

declare global {
  var localFileApi: import('../shared/local-file').LocalFileApi | undefined;
}

const browserFs = async (): Promise<FileSystemAccess> => {
  const api = globalThis.localFileApi;
  if (!api) {
    throw new Error('Local file access is unavailable in this renderer.');
  }
  return {
    async readDirectory() {
      return api.workspace.listInput();
    },
    async readFile(filePath) {
      const source = await api.workspace.readScript(filePath.replace(/^input\//, ''));
      if (source === null) throw Object.assign(new Error('Not found'), {code: 'ENOENT'});
      return source;
    },
    async stat(filePath) {
      const entry = (await api.workspace.listInput()).find((item) => `input/${item.name}` === filePath);
      return {mtime: entry?.mtime ? new Date(entry.mtime) : undefined};
    },
  };
};

function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

function scriptPathFor(videoId: string): string {
  return joinPath('input', `${videoId}.json`);
}

function isVideoScriptLike(value: unknown): value is VideoScript {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as {id?: unknown; title?: unknown; scenes?: unknown};
  return typeof candidate.id === 'string' && typeof candidate.title === 'string' && Array.isArray(candidate.scenes);
}

export async function listVideoProjects(fsAccess?: FileSystemAccess): Promise<VideoProjectSummary[]> {
  const fs = fsAccess ?? (await browserFs());
  try {
    const entries = await fs.readDirectory('input');
    const jsonFiles = entries.filter((entry) => entry.kind === 'file' && entry.name.endsWith('.json'));
    const summaries = await Promise.all(
      jsonFiles.map(async (entry) => {
        const videoId = entry.name.replace(/\.json$/, '');
        const filePath = joinPath('input', entry.name);
        const stats = await fs.stat(filePath).catch((): {mtime?: Date} => ({}));
        return {
          videoId,
          fileName: entry.name,
          filePath,
          lastModifiedAt: stats.mtime?.toISOString(),
        };
      }),
    );

    return summaries.sort((a, b) => a.videoId.localeCompare(b.videoId));
  } catch {
    return [];
  }
}

export async function loadWorkspace(videoIdInput: string, fsAccess?: FileSystemAccess): Promise<WorkspaceOpenResult> {
  const validationError = validateVideoId(videoIdInput);
  if (validationError) {
    return {status: 'failed', error: validationError};
  }

  const videoId = normalizeVideoId(videoIdInput);
  const targetPath = scriptPathFor(videoId);
  const fs = fsAccess ?? (await browserFs());

  try {
    const source = await fs.readFile(targetPath);
    let parsed: unknown;
    try {
      parsed = JSON.parse(source);
    } catch {
      return {status: 'failed', error: createInvalidScriptError(targetPath, '台本JSONの形式が不正です。')};
    }

    if (!isVideoScriptLike(parsed)) {
      return {status: 'failed', error: createInvalidScriptError(targetPath, '台本JSONの内容が仕様に合っていません。')};
    }

    return {status: 'opened', workspace: createExistingWorkspace(videoId, parsed)};
  } catch (error) {
    const nodeError = error as {code?: string};
    if (nodeError.code === 'ENOENT') {
      return {status: 'opened', workspace: createEmptyDraftWorkspace(videoId)};
    }
    return {status: 'failed', error: createFileSystemError(targetPath)};
  }
}

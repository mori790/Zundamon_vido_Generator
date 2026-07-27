import {randomUUID} from 'node:crypto';
import {constants} from 'node:fs';
import {access, copyFile, mkdir, readFile, readdir, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {dialog, shell} from 'electron';
import {buildPublicVisualPath, isAllowedImageFileName, MAX_IMAGE_BYTES, type AssetCopyResult} from '../shared/asset';
import type {LocalAssetSelection, LocalFileApi} from '../shared/local-file';

export function createLocalFileService(root = process.cwd(), testAssetPath?: string): LocalFileApi {
  const selections = new Map<string, {path: string; fileName: string}>();
  const resolveInput = (name: string) => confined(root, 'input', name);
  const resolveStudio = (videoId: string, file: string) =>
    confined(root, 'generated/studio', safeVideoId(videoId), file);
  const resolvePublic = (publicPath: string) =>
    confined(root, 'public', publicPath.replace(/^[/\\]+/, ''));

  return {
    workspace: {
      async listInput() {
        const entries = await readdir(path.join(root, 'input'), {withFileTypes: true});
        return Promise.all(entries.map(async (entry) => {
          const target = resolveInput(entry.name);
          const info = await stat(target).catch(() => null);
          return {name: entry.name, kind: entry.isFile() ? 'file' as const : 'directory' as const, mtime: info?.mtime.toISOString()};
        }));
      },
      async readScript(fileName) {
        try {
          return await readFile(resolveInput(fileName), 'utf8');
        } catch (error) {
          if ((error as {code?: string}).code === 'ENOENT') return null;
          throw error;
        }
      },
      async writeScript(fileName, data) {
        await writeFile(resolveInput(fileName), data, 'utf8');
      },
    },
    chat: {
      async read(videoId) {
        try {
          return await readFile(resolveStudio(videoId, 'chat-history.json'), 'utf8');
        } catch (error) {
          if ((error as {code?: string}).code === 'ENOENT') return null;
          throw error;
        }
      },
      async write(videoId, data) {
        const target = resolveStudio(videoId, 'chat-history.json');
        await mkdir(path.dirname(target), {recursive: true});
        await writeFile(target, data, {encoding: 'utf8', mode: 0o600});
      },
    },
    asset: {
      async select(): Promise<LocalAssetSelection | null> {
        const result = testAssetPath ? null : await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{name: 'Images', extensions: ['png', 'jpg', 'jpeg']}],
        });
        const sourcePath = testAssetPath ?? result?.filePaths[0];
        if (result?.canceled || !sourcePath) return null;
        const fileName = path.basename(sourcePath);
        const info = await stat(sourcePath);
        if (!info.isFile() || !isAllowedImageFileName(fileName) || info.size > MAX_IMAGE_BYTES) {
          throw new Error('PNG/JPEG画像は20 MB以下にしてください。');
        }
        const token = randomUUID();
        selections.set(token, {path: sourcePath, fileName});
        return {token, fileName, bytes: new Uint8Array(await readFile(sourcePath))};
      },
      async copy(videoId, token, overwrite): Promise<AssetCopyResult> {
        const selected = selections.get(token);
        if (!selected) return {status: 'failed', message: '画像選択の有効期限が切れました。'};
        const publicPath = buildPublicVisualPath(videoId, selected.fileName);
        const destination = resolvePublic(publicPath);
        try {
          await mkdir(path.dirname(destination), {recursive: true});
          await copyFile(selected.path, destination, overwrite ? 0 : constants.COPYFILE_EXCL);
          selections.delete(token);
          return {status: 'copied', publicPath};
        } catch (error) {
          if ((error as {code?: string}).code === 'EEXIST') return {status: 'replacement-required', publicPath};
          return {status: 'failed', message: error instanceof Error ? error.message : '画像コピーに失敗しました。'};
        }
      },
      async exists(publicPath) {
        try {
          await access(resolvePublic(publicPath));
          return true;
        } catch {
          return false;
        }
      },
      async trash(publicPath) {
        await shell.trashItem(resolvePublic(publicPath));
      },
    },
    draft: {
      async read(videoId) {
        try {
          return await readFile(resolveStudio(videoId, 'draft-text.json'), 'utf8');
        } catch (error) {
          if ((error as {code?: string}).code === 'ENOENT') return null;
          throw error;
        }
      },
      async write(videoId, data) {
        const target = resolveStudio(videoId, 'draft-text.json');
        await mkdir(path.dirname(target), {recursive: true});
        await writeFile(target, data, {encoding: 'utf8'});
      },
    },
  };
}

function confined(root: string, base: string, ...parts: string[]): string {
  const directory = path.resolve(root, base);
  const candidate = path.resolve(directory, ...parts);
  if (candidate !== directory && !candidate.startsWith(`${directory}${path.sep}`)) {
    throw new Error('Workspace外のパスは操作できません。');
  }
  return candidate;
}

function safeVideoId(videoId: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(videoId) || videoId.includes('..')) throw new Error('動画IDが不正です。');
  return videoId;
}

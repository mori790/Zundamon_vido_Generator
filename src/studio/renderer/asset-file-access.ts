import {
  buildPublicVisualPath,
  isAllowedImageFileName,
  MAX_IMAGE_BYTES,
  type AssetCopyResult,
  type SelectedImage,
} from '../shared/asset';

type NodeRequire = (id: string) => unknown;

declare global {
  interface Window {
    require?: NodeRequire;
  }
}

export type AssetFileAccess = {
  selectImage(): Promise<SelectedImage | null>;
  copyImage(videoId: string, selected: SelectedImage, overwrite?: boolean): Promise<AssetCopyResult>;
  exists(publicPath: string): Promise<boolean>;
  trash(publicPath: string): Promise<void>;
};

type AssetFileAccessOptions = {
  workspaceRoot?: string;
  decodeImage?(file: File): Promise<void>;
  selectImage?(): Promise<SelectedImage | null>;
  trashItem?(path: string): Promise<void>;
};

export function createRendererAssetFileAccess(options: AssetFileAccessOptions = {}): AssetFileAccess {
  const require = window.require;
  if (!require) {
    return unavailableAssetFileAccess();
  }
  const fs = require('node:fs/promises') as typeof import('node:fs/promises');
  const fsConstants = (require('node:fs') as typeof import('node:fs')).constants;
  const path = require('node:path') as typeof import('node:path');
  const process = require('node:process') as typeof import('node:process');
  const electron = require('electron') as typeof import('electron');
  const workspaceRoot = options.workspaceRoot ?? process.cwd();
  const selectImage = options.selectImage ?? (() => selectLocalImage(electron.webUtils));
  const decodeImage = options.decodeImage ?? decodeSelectedImage;
  const trashItem = options.trashItem ?? ((targetPath) => electron.shell.trashItem(targetPath));

  return {
    selectImage,
    async copyImage(videoId, selected, overwrite = false) {
      try {
        if (!isAllowedImageFileName(selected.fileName)) {
          return {status: 'failed', message: 'PNGまたはJPEGファイルを選択してください。'};
        }
        const sourcePath = await fs.realpath(selected.sourcePath);
        const sourceStat = await fs.stat(sourcePath);
        if (!sourceStat.isFile()) {
          return {status: 'failed', message: '通常の画像ファイルを選択してください。'};
        }
        if (sourceStat.size > MAX_IMAGE_BYTES) {
          return {status: 'failed', message: '画像は20 MB以下にしてください。'};
        }
        await decodeImage(selected.file);

        const {destinationPath, publicPath} = resolveVisualDestination(
          workspaceRoot,
          videoId,
          selected.fileName,
          path,
        );
        if (await pathExists(fs, destinationPath)) {
          if (!overwrite) {
            return {status: 'replacement-required', publicPath};
          }
        }
        await fs.mkdir(path.dirname(destinationPath), {recursive: true});
        await fs.copyFile(sourcePath, destinationPath, overwrite ? 0 : fsConstants.COPYFILE_EXCL);
        return {status: 'copied', publicPath};
      } catch (error) {
        return {
          status: 'failed',
          message: error instanceof Error ? error.message : '画像のコピーに失敗しました。',
        };
      }
    },
    async exists(publicPath) {
      try {
        return await pathExists(fs, resolvePublicAssetPath(workspaceRoot, publicPath, path));
      } catch {
        return false;
      }
    },
    async trash(publicPath) {
      await trashItem(resolvePublicAssetPath(workspaceRoot, publicPath, path));
    },
  };
}

export function resolveVisualDestination(
  workspaceRoot: string,
  videoId: string,
  fileName: string,
  path: typeof import('node:path'),
): {destinationPath: string; publicPath: string} {
  const publicPath = buildPublicVisualPath(videoId, fileName);
  const base = path.resolve(workspaceRoot, 'public', 'visuals', videoId);
  const destinationPath = path.resolve(base, path.basename(fileName));
  if (!destinationPath.startsWith(`${base}${path.sep}`)) {
    throw new Error('画像の保存先が不正です。');
  }
  return {destinationPath, publicPath};
}

export function resolvePublicAssetPath(
  workspaceRoot: string,
  publicPath: string,
  path: typeof import('node:path'),
): string {
  const base = path.resolve(workspaceRoot, 'public');
  const candidate = path.resolve(base, publicPath.replace(/^[/\\]+/, ''));
  if (!candidate.startsWith(`${base}${path.sep}`)) {
    throw new Error('public配下以外の画像は操作できません。');
  }
  return candidate;
}

async function selectLocalImage(webUtils: typeof import('electron').webUtils): Promise<SelectedImage | null> {
  const file = await new Promise<File | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg,.jpeg,image/png,image/jpeg';
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), {once: true});
    input.addEventListener('cancel', () => resolve(null), {once: true});
    input.click();
  });
  if (!file) {
    return null;
  }
  return {file, fileName: file.name, sourcePath: webUtils.getPathForFile(file)};
}

async function decodeSelectedImage(file: File): Promise<void> {
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width <= 0 || bitmap.height <= 0) {
      throw new Error('画像を読み込めません。');
    }
  } finally {
    bitmap.close();
  }
}

async function pathExists(fs: typeof import('node:fs/promises'), targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function unavailableAssetFileAccess(): AssetFileAccess {
  const message = 'Electronのローカル画像アクセスを利用できません。';
  return {
    async selectImage() {
      throw new Error(message);
    },
    async copyImage() {
      return {status: 'failed', message};
    },
    async exists() {
      return false;
    },
    async trash() {
      throw new Error(message);
    },
  };
}

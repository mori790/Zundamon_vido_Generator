import {
  buildPublicVisualPath,
  isAllowedImageFileName,
  MAX_IMAGE_BYTES,
  type AssetCopyResult,
  type SelectedImage,
} from '../shared/asset';

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
  const api = globalThis.localFileApi;
  if (!api) {
    return unavailableAssetFileAccess();
  }
  const decodeImage = options.decodeImage ?? decodeSelectedImage;

  return {
    async selectImage() {
      if (options.selectImage) return options.selectImage();
      const selected = await api.asset.select();
      if (!selected) return null;
      return {
        sourcePath: selected.token,
        fileName: selected.fileName,
        file: new File([new Uint8Array(selected.bytes).buffer as ArrayBuffer], selected.fileName),
      };
    },
    async copyImage(videoId, selected, overwrite = false) {
      try {
        if (!isAllowedImageFileName(selected.fileName)) {
          return {status: 'failed', message: 'PNGまたはJPEGファイルを選択してください。'};
        }
        if (selected.file.size > MAX_IMAGE_BYTES) {
          return {status: 'failed', message: '画像は20 MB以下にしてください。'};
        }
        await decodeImage(selected.file);
        return api.asset.copy(videoId, selected.sourcePath, overwrite);
      } catch (error) {
        return {
          status: 'failed',
          message: error instanceof Error ? error.message : '画像のコピーに失敗しました。',
        };
      }
    },
    async exists(publicPath) {
      return api.asset.exists(publicPath);
    },
    async trash(publicPath) {
      await api.asset.trash(publicPath);
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

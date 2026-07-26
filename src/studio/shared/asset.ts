import type {VideoScript} from '../../types/video';

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'] as const;

export type SelectedImage = {
  sourcePath: string;
  fileName: string;
  file: File;
};

export type AssetReference = {
  publicPath: string;
  sceneId?: string;
};

export type SceneAssetStatus = {
  sceneId: string;
  publicPath: string;
  status: 'available' | 'missing' | 'failed';
};

export type AssetCopyResult =
  | {status: 'copied'; publicPath: string}
  | {status: 'replacement-required'; publicPath: string}
  | {status: 'failed'; message: string};

export function isAllowedImageFileName(fileName: string): boolean {
  const normalized = fileName.toLowerCase();
  return (
    fileName === fileName.split(/[\\/]/).at(-1) &&
    IMAGE_EXTENSIONS.some((extension) => normalized.endsWith(extension))
  );
}

export function buildPublicVisualPath(videoId: string, fileName: string): string {
  if (!isAllowedImageFileName(fileName)) {
    throw new Error('PNGまたはJPEGファイルを選択してください。');
  }
  return `/visuals/${videoId}/${fileName}`;
}

export function collectAssetReferences(script: VideoScript): AssetReference[] {
  const references: AssetReference[] = [];
  if (script.video.background) {
    references.push({publicPath: script.video.background});
  }
  if (script.video.bgm) {
    references.push({publicPath: script.video.bgm});
  }
  for (const scene of script.scenes) {
    if (scene.visual?.type === 'image') {
      references.push({publicPath: scene.visual.src, sceneId: scene.id});
    }
  }
  return references;
}

export function collectSceneImageReferences(script: VideoScript): Array<Required<AssetReference>> {
  return collectAssetReferences(script).filter(
    (reference): reference is Required<AssetReference> => reference.sceneId !== undefined,
  );
}

export function isAssetReferenced(script: VideoScript, publicPath: string): boolean {
  return collectAssetReferences(script).some((reference) => reference.publicPath === publicPath);
}

export async function checkSceneAssets(
  script: VideoScript,
  exists: (publicPath: string) => Promise<boolean>,
  generation = 0,
): Promise<{generation: number; statuses: SceneAssetStatus[]}> {
  const statuses = await Promise.all(
    collectSceneImageReferences(script).map(async ({publicPath, sceneId}) => {
      try {
        return {
          publicPath,
          sceneId,
          status: (await exists(publicPath) ? 'available' : 'missing') as SceneAssetStatus['status'],
        };
      } catch {
        return {publicPath, sceneId, status: 'failed' as const};
      }
    }),
  );
  return {generation, statuses};
}

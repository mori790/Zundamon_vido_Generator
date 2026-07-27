import path from 'node:path';
import {resolvePublicReference} from './path-resolver';
import type {AssetCheckResult, Emotion, ValidationIssue, VideoScript} from '../types/video';
import {pathExists} from '../utils/file';

const emotions: Emotion[] = ['normal', 'happy', 'surprised', 'troubled'];

export async function checkAssets(script: VideoScript): Promise<AssetCheckResult> {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (script.video.background) {
    await requirePublicAsset(script.video.background, errors, {
      code: 'BACKGROUND_NOT_FOUND',
      message: '背景画像が見つかりません。',
      videoId: script.id,
    });
  }

  if (script.video.bgm) {
    const exists = await publicAssetExists(script.video.bgm);
    if (!exists) {
      warnings.push({
        code: 'BGM_NOT_FOUND',
        message: 'BGMが存在しません',
        videoId: script.id,
        targetPath: script.video.bgm,
      });
    }
  }

  for (const scene of script.scenes) {
    if (scene.visual?.type === 'image') {
      await requirePublicAsset(scene.visual.src, errors, {
        code: 'VISUAL_NOT_FOUND',
        message: '説明画像が見つかりません。',
        videoId: script.id,
        sceneId: scene.id,
      });
    }
  }

  const characterErrors = await checkCharacterAssets(script.id);
  errors.push(...characterErrors);

  return {errors, warnings};
}

async function requirePublicAsset(
  publicPath: string,
  errors: ValidationIssue[],
  issue: Omit<ValidationIssue, 'targetPath'>,
): Promise<void> {
  const exists = await publicAssetExists(publicPath);
  if (!exists) {
    errors.push({...issue, targetPath: publicPath});
  }
}

async function publicAssetExists(publicPath: string): Promise<boolean> {
  const filePath = resolvePublicReference(publicPath);
  return pathExists(filePath);
}

async function checkCharacterAssets(videoId: string): Promise<ValidationIssue[]> {
  const errors: ValidationIssue[] = [];
  for (const emotion of emotions) {
    for (const mouth of ['open', 'close'] as const) {
      const png = `/characters/zundamon/${emotion}-${mouth}.png`;
      const svg = `/characters/zundamon/${emotion}-${mouth}.svg`;
      const pngExists = await pathExists(resolvePublicReference(png));
      const svgExists = await pathExists(resolvePublicReference(svg));
      if (!pngExists && !svgExists) {
        errors.push({
          code: 'CHARACTER_ASSET_NOT_FOUND',
          message: '立ち絵ファイルが見つかりません',
          videoId,
          targetPath: `${png} または ${svg}`,
        });
      }
    }
  }

  return errors;
}

export function toPublicPath(filePath: string): string {
  return `/${filePath.split(path.sep).join('/')}`;
}

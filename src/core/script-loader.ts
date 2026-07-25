import {readFile} from 'node:fs/promises';
import {videoScriptSchema} from '../schemas/video-script';
import type {ValidationIssue, VideoScript} from '../types/video';
import {AppError} from './errors';
import {resolveInputScriptPath, validateVideoId} from './path-resolver';
import {pathExists} from '../utils/file';

export async function loadVideoScript(videoId: string): Promise<VideoScript> {
  validateVideoId(videoId);
  const filePath = resolveInputScriptPath(videoId);
  if (!(await pathExists(filePath))) {
    throw new AppError({
      code: 'SCRIPT_NOT_FOUND',
      message: `動画台本が見つかりません。\n対象: input/${videoId}.json`,
      videoId,
      targetPath: `input/${videoId}.json`,
    });
  }

  const json = JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  const script = parseVideoScript(json);
  if (script.id !== videoId) {
    throw new AppError({
      code: 'SCRIPT_VALIDATION_FAILED',
      message: `台本IDがファイル名と一致しません: ${script.id}`,
      videoId,
    });
  }
  return script;
}

export function parseVideoScript(input: unknown): VideoScript {
  const result = videoScriptSchema.safeParse(input);
  if (!result.success) {
    throw new AppError({
      code: 'SCRIPT_VALIDATION_FAILED',
      message: result.error.issues
        .map((issue) => `${issue.path.join('.') || 'script'}: ${issue.message}`)
        .join('\n'),
    });
  }
  return result.data;
}

export function collectScriptWarnings(script: VideoScript): ValidationIssue[] {
  const warnings: ValidationIssue[] = [];
  if (!script.description) {
    warnings.push({code: 'EMPTY_DESCRIPTION', message: 'descriptionが空です', videoId: script.id});
  }
  if (!script.scenes.some((scene) => scene.type === 'title')) {
    warnings.push({code: 'NO_TITLE_SCENE', message: 'タイトルシーンが存在しません', videoId: script.id});
  }
  if (!script.scenes.some((scene) => scene.type === 'ending')) {
    warnings.push({code: 'NO_ENDING_SCENE', message: 'エンディングシーンが存在しません', videoId: script.id});
  }
  for (const scene of script.scenes) {
    if (!scene.visual) {
      warnings.push({
        code: 'NO_SCENE_VISUAL',
        message: '説明素材が設定されていません',
        videoId: script.id,
        sceneId: scene.id,
      });
    }
    if (scene.text.length > script.subtitle.maxCharactersPerLine * script.subtitle.maxLines) {
      warnings.push({
        code: 'LONG_SUBTITLE',
        message: '字幕が推奨文字数を超えています',
        videoId: script.id,
        sceneId: scene.id,
      });
    }
  }
  return warnings;
}

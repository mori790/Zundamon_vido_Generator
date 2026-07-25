import path from 'node:path';
import {directories, env, workspaceRoot} from './config';
import {AppError} from './errors';
import type {AudioPathInfo} from '../types/video';

const safeVideoIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export function validateVideoId(videoId: string): void {
  if (!safeVideoIdPattern.test(videoId)) {
    throw new AppError({
      code: 'SCRIPT_VALIDATION_FAILED',
      message: `動画IDが不正です: ${videoId}`,
      videoId,
    });
  }
}

export function resolveWorkspacePath(...segments: string[]): string {
  return path.join(workspaceRoot, ...segments);
}

export function resolveInputScriptPath(videoId: string): string {
  validateVideoId(videoId);
  return path.join(directories.input, `${videoId}.json`);
}

export function resolveManifestPath(videoId: string): string {
  validateVideoId(videoId);
  return path.join(directories.manifests, `${videoId}.manifest.json`);
}

export function resolveTimelinePath(videoId: string): string {
  validateVideoId(videoId);
  return path.join(directories.timelines, `${videoId}.timeline.json`);
}

export function resolveOutputPath(videoId: string): string {
  validateVideoId(videoId);
  return path.join(directories.output, `${videoId}.mp4`);
}

export function resolveAudioPath(videoId: string, sceneId: string): AudioPathInfo {
  validateVideoId(videoId);
  const publicPath = `/audio/${videoId}/${sceneId}.wav`;
  return {
    publicPath,
    filePath: path.join(workspaceRoot, env.audioDir, videoId, `${sceneId}.wav`),
  };
}

export function resolvePublicReference(publicPath: string): string {
  if (!publicPath.startsWith('/')) {
    throw new AppError({
      code: 'SCRIPT_VALIDATION_FAILED',
      message: `public配下の参照は / から始めてください: ${publicPath}`,
      targetPath: publicPath,
    });
  }

  const withoutLeadingSlash = publicPath.replace(/^\/+/, '');
  const normalized = path.normalize(withoutLeadingSlash);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new AppError({
      code: 'SCRIPT_VALIDATION_FAILED',
      message: `public配下の参照が不正です: ${publicPath}`,
      targetPath: publicPath,
    });
  }

  const resolved = path.join(directories.public, normalized);
  const relative = path.relative(directories.public, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AppError({
      code: 'SCRIPT_VALIDATION_FAILED',
      message: `public配下の参照が不正です: ${publicPath}`,
      targetPath: publicPath,
    });
  }

  return resolved;
}

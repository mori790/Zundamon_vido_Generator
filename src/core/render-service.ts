import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {directories} from './config';
import {AppError} from './errors';
import {Logger} from './logger';
import {resolveOutputPath, resolveWorkspacePath} from './path-resolver';
import {buildRenderData} from './render-data-builder';
import type {RenderOptions, RenderResult} from '../types/video';
import {ensureDir} from '../utils/file';

export async function renderVideo(videoId: string, options: RenderOptions = {}): Promise<RenderResult> {
  const logger = new Logger(options.verbose);
  const inputProps = await buildRenderData(videoId);
  const outputPath = resolveOutputPath(videoId);

  try {
    logger.info('動画をレンダリングしています');
    const entryPoint = resolveWorkspacePath('src', 'Root.tsx');
    const serveUrl = await bundle({
      entryPoint,
    });
    const composition = await selectComposition({
      serveUrl,
      id: 'ZundamonVideo',
      inputProps,
    });

    await ensureDir(path.dirname(outputPath));
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
    });

    logger.info(`出力完了: ${path.relative(directories.output, outputPath).startsWith('..') ? outputPath : `output/${path.basename(outputPath)}`}`);
    return {videoId, outputPath};
  } catch (cause) {
    throw new AppError({
      code: 'RENDER_FAILED',
      message: '動画のレンダリングに失敗しました。\nRemotionまたはFFmpegのログを確認してください。',
      videoId,
      targetPath: outputPath,
      cause,
    });
  }
}

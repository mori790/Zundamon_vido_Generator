import {stat as statFile} from 'node:fs/promises';
import {resolveOutputPath, validateVideoId} from '../../core/path-resolver';
import type {RenderOutputStatus} from '../shared/render';

export function createRenderOutputService(dependencies: {
  stat?: typeof statFile;
  confirm(outputPath: string): Promise<boolean>;
  reveal(outputPath: string): void;
}) {
  const stat = dependencies.stat ?? statFile;

  async function status(videoId: string): Promise<RenderOutputStatus> {
    validateVideoId(videoId);
    const outputPath = resolveOutputPath(videoId);
    try {
      const details = await stat(outputPath);
      return {
        videoId,
        outputPath,
        exists: details.isFile(),
        nonZero: details.isFile() && details.size > 0,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {videoId, outputPath, exists: false, nonZero: false};
      }
      throw error;
    }
  }

  async function verify(videoId: string): Promise<RenderOutputStatus> {
    const result = await status(videoId);
    if (!result.nonZero) {
      throw new Error(`Render出力が存在しないか空です: ${result.outputPath}`);
    }
    return result;
  }

  async function confirmOverwrite(videoId: string): Promise<boolean> {
    const result = await status(videoId);
    return !result.exists || dependencies.confirm(result.outputPath);
  }

  async function reveal(videoId: string): Promise<boolean> {
    const result = await verify(videoId);
    dependencies.reveal(result.outputPath);
    return true;
  }

  return {status, verify, confirmOverwrite, reveal};
}

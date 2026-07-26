import {stat as statFile} from 'node:fs/promises';
import {buildRenderData} from '../../core/render-data-builder';
import {
  resolveInputScriptPath,
  resolveManifestPath,
  resolveTimelinePath,
  validateVideoId,
} from '../../core/path-resolver';
import {loadVideoScript} from '../../core/script-loader';
import {loadTimeline} from '../../core/timeline-store';
import {assessPreview, type PreviewLoadResult, type PreviewSnapshot} from '../shared/preview';

export function createPreviewDataService(dependencies = {
  stat: statFile,
  loadScript: loadVideoScript,
  loadTimeline,
  buildRenderData,
}) {
  async function modifiedAt(filePath: string): Promise<number | null> {
    try {
      return (await dependencies.stat(filePath)).mtimeMs;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  async function check(videoId: string): Promise<PreviewSnapshot> {
    validateVideoId(videoId);
    const [scriptModifiedAt, manifestModifiedAt, timelineModifiedAt] = await Promise.all([
      modifiedAt(resolveInputScriptPath(videoId)),
      modifiedAt(resolveManifestPath(videoId)),
      modifiedAt(resolveTimelinePath(videoId)),
    ]);
    const script = scriptModifiedAt === null ? null : await dependencies.loadScript(videoId);
    const timeline = timelineModifiedAt === null ? null : await dependencies.loadTimeline(videoId);
    const source = {
      videoId,
      scriptModifiedAt,
      manifestModifiedAt,
      timelineModifiedAt,
      width: script?.video.width,
      height: script?.video.height,
      fps: script?.video.fps,
      totalFrames: timeline?.totalFrames,
    };
    return {source, readiness: assessPreview(source)};
  }

  async function load(videoId: string): Promise<PreviewLoadResult> {
    const snapshot = await check(videoId);
    if (!snapshot.readiness.ready) {
      throw new Error('プレビュー用データが未生成または古くなっています。');
    }
    return {...snapshot, inputProps: await dependencies.buildRenderData(videoId)};
  }

  return {check, load};
}

const previewDataService = createPreviewDataService();
export const checkPreview = previewDataService.check;
export const loadPreview = previewDataService.load;

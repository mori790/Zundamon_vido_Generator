import type {ZundamonCompositionProps} from '../types/video';
import {loadManifest} from './manifest-store';
import {loadVideoScript} from './script-loader';
import {loadTimeline} from './timeline-store';
import {AppError} from './errors';

export async function buildRenderData(videoId: string): Promise<ZundamonCompositionProps> {
  const script = await loadVideoScript(videoId);
  const manifest = await loadManifest(videoId);
  const timeline = await loadTimeline(videoId);
  if (!timeline) {
    throw new AppError({
      code: 'TIMELINE_GENERATION_FAILED',
      message: 'タイムラインが見つかりません。',
      videoId,
      targetPath: `generated/timelines/${videoId}.timeline.json`,
    });
  }
  return {script, manifest, timeline};
}

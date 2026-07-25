import type {Timeline, VideoScript, VoiceManifest} from '../types/video';
import {secondsToFrames} from '../utils/frame';
import {AppError} from './errors';

export function generateTimeline(script: VideoScript, manifest: VoiceManifest): Timeline {
  try {
    let cursor = 0;
    const scenes = script.scenes.map((scene) => {
      const entry = manifest.scenes[scene.id];
      if (!entry) {
        throw new Error(`manifest entry not found: ${scene.id}`);
      }

      const beforeFrames = secondsToFrames(scene.durationBeforeSpeech, script.video.fps);
      const audioDurationInFrames = secondsToFrames(entry.durationSeconds, script.video.fps);
      const afterFrames = secondsToFrames(scene.durationAfterSpeech, script.video.fps);
      const durationInFrames = beforeFrames + audioDurationInFrames + afterFrames;
      const startFrame = cursor;
      cursor += durationInFrames;

      return {
        id: scene.id,
        startFrame,
        audioStartFrame: startFrame + beforeFrames,
        durationInFrames,
        audioDurationInFrames,
        audioPath: entry.audioPath,
      };
    });

    return {
      videoId: script.id,
      fps: script.video.fps,
      totalFrames: cursor,
      scenes,
    };
  } catch (cause) {
    throw new AppError({
      code: 'TIMELINE_GENERATION_FAILED',
      message: 'タイムラインの生成に失敗しました。',
      videoId: script.id,
      cause,
    });
  }
}

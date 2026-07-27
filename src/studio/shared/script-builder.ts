import type {
  Scene as VideoScene,
  SceneType,
  SpeakerConfig,
  SubtitleConfig,
  VideoConfig,
  VideoScript,
} from '../../types/video';
import type {SceneWithAsset} from './scene-segmentation';

const DEFAULT_SPEAKER: SpeakerConfig = {
  engine: 'voicevox',
  speakerId: 3,
  speedScale: 1.05,
  pitchScale: 0,
  intonationScale: 1,
  volumeScale: 1,
};

const DEFAULT_VIDEO: VideoConfig = {
  width: 1920,
  height: 1080,
  fps: 30,
  background: '/backgrounds/default.svg',
  bgmVolume: 0.1,
};

const DEFAULT_SUBTITLE: SubtitleConfig = {
  enabled: true,
  maxCharactersPerLine: 24,
  maxLines: 2,
  fontSize: 56,
  bottom: 50,
  highlightKeywords: [],
};

export function resolveSceneType(index: number, total: number): SceneType {
  if (index === 0) return 'title';
  if (index === total - 1) return 'ending';
  return 'explanation';
}

export function buildVideoScript(scenes: SceneWithAsset[], videoId: string, title: string): VideoScript {
  const total = scenes.length;
  const mappedScenes: VideoScene[] = scenes.map((scene, index) => ({
    id: scene.id,
    type: resolveSceneType(index, total),
    text: scene.narration,
    emotion: 'normal',
    visual: scene.assetPublicPath
      ? {type: 'image', src: scene.assetPublicPath, position: 'center', fit: 'contain'}
      : {type: 'none'},
    durationBeforeSpeech: 0.2,
    durationAfterSpeech: 0.3,
    characterVisible: true,
  }));
  return {
    id: videoId,
    title,
    speaker: DEFAULT_SPEAKER,
    video: DEFAULT_VIDEO,
    subtitle: DEFAULT_SUBTITLE,
    scenes: mappedScenes,
  };
}

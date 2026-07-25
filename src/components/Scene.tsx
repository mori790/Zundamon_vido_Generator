import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {Scene as SceneData, SubtitleConfig, TimelineScene, VideoConfig} from '../types/video';
import {Character} from './Character';
import {EndingScene} from './EndingScene';
import {Subtitle} from './Subtitle';
import {TitleScene} from './TitleScene';
import {Visual} from './Visual';

export type SceneProps = {
  videoId: string;
  scene: SceneData;
  timelineScene: TimelineScene;
  subtitleConfig: SubtitleConfig;
  videoConfig: VideoConfig;
};

export const Scene: React.FC<SceneProps> = ({videoId, scene, timelineScene, subtitleConfig, videoConfig}) => {
  const frame = useCurrentFrame();
  const localAudioStart = timelineScene.audioStartFrame - timelineScene.startFrame;
  const audioEnd = localAudioStart + timelineScene.audioDurationInFrames;
  const isSpeaking = frame >= localAudioStart && frame < audioEnd;
  const showSubtitle = isSpeaking && subtitleConfig.enabled;

  if (scene.type === 'title') {
    return (
      <TitleScene scene={scene} videoId={videoId} isSpeaking={isSpeaking}>
        <Subtitle scene={scene} config={subtitleConfig} visible={showSubtitle} />
      </TitleScene>
    );
  }

  if (scene.type === 'ending') {
    return (
      <EndingScene scene={scene} videoId={videoId} isSpeaking={isSpeaking}>
        <Subtitle scene={scene} config={subtitleConfig} visible={showSubtitle} />
      </EndingScene>
    );
  }

  return (
    <AbsoluteFill style={{padding: 64}}>
      <Visual visual={scene.visual} videoConfig={videoConfig} />
      <Character
        videoId={videoId}
        emotion={scene.emotion}
        visible={scene.characterVisible}
        isSpeaking={isSpeaking}
      />
      <Subtitle scene={scene} config={subtitleConfig} visible={showSubtitle} />
    </AbsoluteFill>
  );
};

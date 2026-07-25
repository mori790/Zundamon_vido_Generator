import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Scene} from '../types/video';
import {Character} from './Character';

export type TitleSceneProps = {
  scene: Scene;
  videoId: string;
  isSpeaking: boolean;
  children?: React.ReactNode;
};

export const TitleScene: React.FC<TitleSceneProps> = ({scene, videoId, isSpeaking, children}) => {
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: 96}}>
      <h1 style={{fontSize: 92, lineHeight: 1.18, width: 1180, color: '#123524', margin: 0}}>{scene.text}</h1>
      <Character videoId={videoId} emotion={scene.emotion} visible={scene.characterVisible} isSpeaking={isSpeaking} />
      {children}
    </AbsoluteFill>
  );
};

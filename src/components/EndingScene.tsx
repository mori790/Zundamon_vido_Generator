import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Scene} from '../types/video';
import {Character} from './Character';

export type EndingSceneProps = {
  scene: Scene;
  videoId: string;
  isSpeaking: boolean;
  children?: React.ReactNode;
};

export const EndingScene: React.FC<EndingSceneProps> = ({scene, videoId, isSpeaking, children}) => {
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-start', padding: 96}}>
      <h2 style={{fontSize: 72, lineHeight: 1.25, width: 1120, color: '#123524', margin: 0}}>{scene.text}</h2>
      <div style={{fontSize: 30, color: '#285943', marginTop: 48}}>VOICEVOX:ずんだもん</div>
      <Character videoId={videoId} emotion={scene.emotion} visible={scene.characterVisible} isSpeaking={isSpeaking} />
      {children}
    </AbsoluteFill>
  );
};

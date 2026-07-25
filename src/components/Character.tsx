import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import type {Emotion} from '../types/video';
import {selectCharacterAsset} from '../utils/text';

export type CharacterProps = {
  videoId: string;
  emotion: Emotion;
  visible: boolean;
  isSpeaking: boolean;
  lipSyncIntervalFrames?: number;
};

export const Character: React.FC<CharacterProps> = ({
  videoId,
  emotion,
  visible,
  isSpeaking,
  lipSyncIntervalFrames = 5,
}) => {
  const frame = useCurrentFrame();
  if (!visible) {
    return null;
  }

  const mouthOpen = isSpeaking && Math.floor(frame / lipSyncIntervalFrames) % 2 === 0;
  const motion = isSpeaking ? Math.sin(frame / 6) * 3 : 0;
  const asset = selectCharacterAsset(emotion, mouthOpen, videoId).replace(/^\//, '');

  return (
    <Img
      src={staticFile(asset)}
      style={{
        position: 'absolute',
        right: 40,
        bottom: 100 + motion,
        width: 420,
        height: 420,
        objectFit: 'contain',
      }}
    />
  );
};

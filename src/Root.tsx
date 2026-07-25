import React from 'react';
import {Composition} from 'remotion';
import {ZundamonVideo} from './compositions/ZundamonVideo';
import type {ZundamonCompositionProps} from './types/video';

const defaultProps: ZundamonCompositionProps = {
  script: {
    id: 'sample-video',
    title: 'Sample Video',
    speaker: {
      engine: 'voicevox',
      speakerId: 3,
      speedScale: 1,
      pitchScale: 0,
      intonationScale: 1,
      volumeScale: 1,
    },
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      background: '/backgrounds/default.svg',
      bgmVolume: 0.1,
    },
    subtitle: {
      enabled: true,
      maxCharactersPerLine: 24,
      maxLines: 2,
      fontSize: 56,
      bottom: 50,
      highlightKeywords: [],
    },
    scenes: [],
  },
  timeline: {
    videoId: 'sample-video',
    fps: 30,
    totalFrames: 300,
    scenes: [],
  },
  manifest: {
    videoId: 'sample-video',
    scenes: {},
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ZundamonVideo"
      component={ZundamonVideo}
      durationInFrames={defaultProps.timeline.totalFrames}
      fps={defaultProps.timeline.fps}
      width={defaultProps.script.video.width}
      height={defaultProps.script.video.height}
      defaultProps={defaultProps}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.max(1, props.timeline.totalFrames),
        fps: props.timeline.fps,
        width: props.script.video.width,
        height: props.script.video.height,
      })}
    />
  );
};

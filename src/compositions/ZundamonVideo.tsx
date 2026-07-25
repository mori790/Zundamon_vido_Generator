import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import type {ZundamonCompositionProps} from '../types/video';
import {Scene} from '../components/Scene';

export const ZundamonVideo: React.FC<ZundamonCompositionProps> = ({script, timeline}) => {
  const background = script.video.background;
  const backgroundStyle: React.CSSProperties = background
    ? {
        backgroundImage: `url(${staticFile(background.replace(/^\//, ''))})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {backgroundColor: '#eef6f2'};

  return (
    <AbsoluteFill style={{...backgroundStyle, fontFamily: 'sans-serif', color: 'white'}}>
      {script.video.bgm ? (
        <Audio src={staticFile(script.video.bgm.replace(/^\//, ''))} volume={script.video.bgmVolume} />
      ) : null}
      {timeline.scenes.map((timelineScene) => {
        const scene = script.scenes.find((candidate) => candidate.id === timelineScene.id);
        if (!scene) {
          return null;
        }

        return (
          <Sequence
            key={scene.id}
            from={timelineScene.startFrame}
            durationInFrames={timelineScene.durationInFrames}
          >
            <Audio
              src={staticFile(timelineScene.audioPath.replace(/^\//, ''))}
              startFrom={0}
              endAt={timelineScene.audioDurationInFrames}
            />
            <Scene
              videoId={script.id}
              scene={scene}
              timelineScene={timelineScene}
              subtitleConfig={script.subtitle}
              videoConfig={script.video}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

import React from 'react';
import {Img, staticFile} from 'remotion';
import type {VideoConfig, VisualConfig} from '../types/video';

export type VisualProps = {
  visual?: VisualConfig;
  videoConfig: VideoConfig;
};

export const Visual: React.FC<VisualProps> = ({visual}) => {
  if (!visual || visual.type === 'none') {
    return null;
  }

  if (visual.type === 'image') {
    const position = visual.position ?? 'center';
    const justifyContent = position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center';
    return (
      <div style={{display: 'flex', justifyContent, alignItems: 'center', height: '72%', paddingRight: 460}}>
        <Img
          src={staticFile(visual.src.replace(/^\//, ''))}
          style={{
            maxWidth: '1040px',
            maxHeight: '680px',
            objectFit: visual.fit ?? 'contain',
            borderRadius: 8,
            boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
          }}
        />
      </div>
    );
  }

  if (visual.type === 'code') {
    const lines = visual.code.split('\n');
    return (
      <div
        style={{
          width: 1060,
          maxHeight: 690,
          overflow: 'hidden',
          background: '#111827',
          color: '#e5e7eb',
          borderRadius: 8,
          padding: 28,
          fontFamily: 'Menlo, Monaco, Consolas, monospace',
          fontSize: 30,
          lineHeight: 1.45,
        }}
      >
        {visual.fileName ? <div style={{color: '#93c5fd', marginBottom: 18}}>{visual.fileName}</div> : null}
        {lines.map((line, index) => (
          <div key={`${index}-${line}`} style={{display: 'flex'}}>
            <span style={{width: 48, color: '#6b7280', textAlign: 'right', marginRight: 20}}>{index + 1}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        width: 980,
        minHeight: 360,
        background: 'rgba(15, 23, 42, 0.82)',
        borderRadius: 8,
        padding: 48,
        color: 'white',
      }}
    >
      {visual.heading ? <h2 style={{fontSize: 58, margin: '0 0 28px'}}>{visual.heading}</h2> : null}
      <p style={{fontSize: 44, lineHeight: 1.45, margin: 0}}>{visual.body}</p>
    </div>
  );
};

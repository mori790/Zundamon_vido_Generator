import React from 'react';
import type {Scene, SubtitleConfig} from '../types/video';
import {calculateSubtitleFontSize, splitSubtitle} from '../utils/text';

export type SubtitleProps = {
  scene: Scene;
  config: SubtitleConfig;
  visible: boolean;
};

export const Subtitle: React.FC<SubtitleProps> = ({scene, config, visible}) => {
  if (!visible || !config.enabled) {
    return null;
  }

  const lines = splitSubtitle(scene.text, config).slice(0, 3);
  const fontSize = calculateSubtitleFontSize(lines, config);

  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: config.bottom,
        textAlign: 'center',
        fontSize,
        fontWeight: 800,
        lineHeight: 1.25,
        color: 'white',
        WebkitTextStroke: '8px black',
        paintOrder: 'stroke fill',
      }}
    >
      {lines.map((line) => (
        <div key={line}>{renderHighlighted(line, config.highlightKeywords)}</div>
      ))}
    </div>
  );
};

function renderHighlighted(line: string, keywords: string[]): React.ReactNode {
  if (keywords.length === 0) {
    return line;
  }

  const escaped = keywords.map(escapeRegExp).join('|');
  const pattern = new RegExp(`(${escaped})`, 'g');
  return line.split(pattern).map((part, index) =>
    keywords.includes(part) ? (
      <span key={`${part}-${index}`} style={{color: '#ffe066'}}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import {describe, expect, it} from 'vitest';
import type {SubtitleConfig} from '../src/types/video';
import {calculateSubtitleFontSize, splitSubtitle} from '../src/utils/text';

const config: SubtitleConfig = {
  enabled: true,
  maxCharactersPerLine: 12,
  maxLines: 2,
  fontSize: 56,
  bottom: 50,
  highlightKeywords: [],
};

describe('splitSubtitle', () => {
  it('splits long Japanese subtitles', () => {
    const lines = splitSubtitle('これはDeploymentが必要なPod数を維持しているからなのだ。', config);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join('')).toBe('これはDeploymentが必要なPod数を維持しているからなのだ。');
  });

  it('shrinks font when line count exceeds configured max lines', () => {
    expect(calculateSubtitleFontSize(['a', 'b', 'c'], config)).toBeLessThan(config.fontSize);
  });
});

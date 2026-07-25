import type {SubtitleConfig} from '../types/video';

const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'も', 'の', 'へ', 'から', 'まで'];

export function splitSubtitle(text: string, config: SubtitleConfig): string[] {
  const limit = config.maxCharactersPerLine;
  if (text.length <= limit) {
    return [text];
  }

  const lines: string[] = [];
  let rest = text.trim();
  while (rest.length > 0) {
    if (rest.length <= limit) {
      lines.push(rest);
      break;
    }

    const index = findBreakIndex(rest, limit);
    lines.push(rest.slice(0, index).trim());
    rest = rest.slice(index).trim();
  }

  return lines;
}

export function calculateSubtitleFontSize(lines: string[], config: SubtitleConfig): number {
  if (lines.length <= config.maxLines) {
    return config.fontSize;
  }

  const overflow = lines.length - config.maxLines;
  return Math.max(38, config.fontSize - overflow * 6);
}

export function selectCharacterAsset(emotion: string, mouthOpen: boolean, videoId?: string): string {
  const safeEmotion = ['normal', 'happy', 'surprised', 'troubled'].includes(emotion)
    ? emotion
    : 'normal';
  const mouth = mouthOpen ? 'open' : 'close';
  const extension = videoId === 'sample-video' ? 'svg' : 'png';
  return `/characters/zundamon/${safeEmotion}-${mouth}.${extension}`;
}

function findBreakIndex(text: string, limit: number): number {
  const search = text.slice(0, Math.min(text.length, limit + 6));
  const punctuationIndex = Math.max(search.lastIndexOf('、'), search.lastIndexOf('。'));
  if (punctuationIndex > 0) {
    return punctuationIndex + 1;
  }

  for (let index = Math.min(limit, text.length - 1); index > Math.max(0, limit - 8); index--) {
    if (particles.includes(text[index])) {
      return index + 1;
    }
  }

  return Math.min(limit, text.length);
}

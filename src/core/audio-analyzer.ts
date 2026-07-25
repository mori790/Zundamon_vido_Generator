import {readFile} from 'node:fs/promises';
import {AppError} from './errors';

export async function measureWavDuration(filePath: string): Promise<number> {
  try {
    const buffer = await readFile(filePath);
    return measureWavDurationFromBuffer(buffer);
  } catch (cause) {
    throw new AppError({
      code: 'AUDIO_DURATION_FAILED',
      message: '音声時間の取得に失敗しました。',
      targetPath: filePath,
      cause,
    });
  }
}

export function measureWavDurationFromBuffer(buffer: Buffer): number {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('WAVファイルではありません');
  }

  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString('ascii', offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;

    if (chunkId === 'fmt ') {
      byteRate = buffer.readUInt32LE(chunkDataStart + 8);
    } else if (chunkId === 'data') {
      dataSize = chunkSize;
      break;
    }

    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  if (byteRate <= 0 || dataSize <= 0) {
    throw new Error('WAVのfmt/dataチャンクが不正です');
  }

  return dataSize / byteRate;
}

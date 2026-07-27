import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import type {SpeakerConfig, VoiceGenerationOptions, VoiceGenerationResult} from '../types/video';
import {ensureDir, pathExists} from '../utils/file';
import {measureWavDuration} from './audio-analyzer';
import {AppError} from './errors';
import {Logger} from './logger';
import {loadManifest, saveManifest} from './manifest-store';
import {resolveAudioPath} from './path-resolver';
import {loadVideoScript} from './script-loader';
import {checkVoicevoxConnection, createAudioQuery, createVoicevoxClient, synthesizeSpeech} from './voicevox-client';

export function buildVoiceCacheHash(text: string, speaker: SpeakerConfig): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        text,
        speakerId: speaker.speakerId,
        speedScale: speaker.speedScale,
        pitchScale: speaker.pitchScale,
        intonationScale: speaker.intonationScale,
        volumeScale: speaker.volumeScale,
      }),
    )
    .digest('hex');
}

export async function generateVoices(
  videoId: string,
  options: VoiceGenerationOptions = {},
): Promise<VoiceGenerationResult> {
  const logger = new Logger(options.verbose);
  const script = await loadVideoScript(videoId);
  const client = createVoicevoxClient();
  await checkVoicevoxConnection(client);
  logger.info('VOICEVOXへの接続を確認しました');

  const manifest = await loadManifest(videoId);
  const generated: string[] = [];
  const cached: string[] = [];

  for (const scene of script.scenes) {
    const audio = resolveAudioPath(videoId, scene.id);
    const hash = buildVoiceCacheHash(scene.text, script.speaker);
    const existing = manifest.scenes[scene.id];
    const canUseCache = !options.force && existing?.hash === hash && (await pathExists(audio.filePath));

    if (canUseCache) {
      cached.push(scene.id);
      logger.info(`${scene.id}.wav はキャッシュを使用します`);
      continue;
    }

    try {
      const query = await createAudioQuery(client, scene.text, script.speaker.speakerId);
      query.speedScale = script.speaker.speedScale;
      query.pitchScale = script.speaker.pitchScale;
      query.intonationScale = script.speaker.intonationScale;
      query.volumeScale = script.speaker.volumeScale;

      const wav = await synthesizeSpeech(client, query, script.speaker.speakerId);
      await ensureDir(audio.filePath.replace(/\/[^/]+$/, ''));
      await writeFile(audio.filePath, Buffer.from(wav));
      const durationSeconds = await measureWavDuration(audio.filePath);
      manifest.scenes[scene.id] = {
        hash,
        audioPath: audio.publicPath,
        durationSeconds,
      };
      await saveManifest(videoId, manifest);
      generated.push(scene.id);
      logger.info(`${scene.id}.wav を生成しました`);
    } catch (cause) {
      throw new AppError({
        code: 'VOICEVOX_SYNTHESIS_FAILED',
        message: `VOICEVOXで音声生成に失敗しました。\nシーン: ${scene.id}\nセリフ: ${scene.text}`,
        videoId,
        sceneId: scene.id,
        cause,
      });
    }
  }

  await saveManifest(videoId, manifest);
  return {videoId, generated, cached, manifest};
}

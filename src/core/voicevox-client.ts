import {env} from './config';
import {AppError} from './errors';

export type VoicevoxConfig = {
  baseUrl?: string;
};

export type VoicevoxAudioQuery = {
  speedScale?: number;
  pitchScale?: number;
  intonationScale?: number;
  volumeScale?: number;
  [key: string]: unknown;
};

export type VoicevoxClient = {
  baseUrl: string;
};

export function createVoicevoxClient(config: VoicevoxConfig = {}): VoicevoxClient {
  return {
    baseUrl: config.baseUrl ?? env.voicevoxBaseUrl,
  };
}

export async function checkVoicevoxConnection(client: VoicevoxClient): Promise<void> {
  try {
    const response = await fetch(`${client.baseUrl}/version`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (cause) {
    throw new AppError({
      code: 'VOICEVOX_CONNECTION_FAILED',
      message: `VOICEVOX Engineに接続できません。\nVOICEVOXが起動していることを確認してください。\n接続先: ${client.baseUrl}`,
      targetPath: client.baseUrl,
      cause,
    });
  }
}

export async function createAudioQuery(
  client: VoicevoxClient,
  text: string,
  speakerId: number,
): Promise<VoicevoxAudioQuery> {
  const url = new URL('/audio_query', client.baseUrl);
  url.searchParams.set('text', text);
  url.searchParams.set('speaker', String(speakerId));
  const response = await fetch(url, {method: 'POST'});
  if (!response.ok) {
    throw new Error(`VOICEVOX audio_query failed: HTTP ${response.status}`);
  }
  return (await response.json()) as VoicevoxAudioQuery;
}

export async function synthesizeSpeech(
  client: VoicevoxClient,
  query: VoicevoxAudioQuery,
  speakerId: number,
): Promise<ArrayBuffer> {
  const url = new URL('/synthesis', client.baseUrl);
  url.searchParams.set('speaker', String(speakerId));
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(query),
  });
  if (!response.ok) {
    throw new Error(`VOICEVOX synthesis failed: HTTP ${response.status}`);
  }
  return response.arrayBuffer();
}

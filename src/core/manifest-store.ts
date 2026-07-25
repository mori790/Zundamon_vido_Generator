import type {VoiceManifest} from '../types/video';
import {readJson, writeJson, pathExists} from '../utils/file';
import {resolveManifestPath} from './path-resolver';

export async function loadManifest(videoId: string): Promise<VoiceManifest> {
  const filePath = resolveManifestPath(videoId);
  if (!(await pathExists(filePath))) {
    return {videoId, scenes: {}};
  }
  return readJson<VoiceManifest>(filePath);
}

export async function saveManifest(videoId: string, manifest: VoiceManifest): Promise<void> {
  await writeJson(resolveManifestPath(videoId), manifest);
}

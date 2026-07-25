import type {Timeline} from '../types/video';
import {pathExists, readJson, writeJson} from '../utils/file';
import {resolveTimelinePath} from './path-resolver';

export async function saveTimeline(videoId: string, timeline: Timeline): Promise<void> {
  await writeJson(resolveTimelinePath(videoId), timeline);
}

export async function loadTimeline(videoId: string): Promise<Timeline | null> {
  const filePath = resolveTimelinePath(videoId);
  if (!(await pathExists(filePath))) {
    return null;
  }
  return readJson<Timeline>(filePath);
}

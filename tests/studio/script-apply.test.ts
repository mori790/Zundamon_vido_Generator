import {describe, expect, it} from 'vitest';
import {applyScriptDraft, backupPathFor, scriptPathFor, type ScriptFileAccess} from '../../src/studio/shared/script-apply';
import {formatScriptJson} from '../../src/studio/shared/script-draft';
import type {VideoScript} from '../../src/types/video';

function createScript(): VideoScript {
  return {
    id: 'sample-video',
    title: 'Sample',
    speaker: {
      engine: 'voicevox',
      speakerId: 3,
      speedScale: 1,
      pitchScale: 0,
      intonationScale: 1,
      volumeScale: 1,
    },
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      bgmVolume: 0.1,
    },
    subtitle: {
      enabled: true,
      maxCharactersPerLine: 24,
      maxLines: 2,
      fontSize: 56,
      bottom: 50,
      highlightKeywords: [],
    },
    scenes: [
      {
        id: 'scene-001',
        type: 'explanation',
        text: 'テストなのだ。',
        emotion: 'normal',
        durationBeforeSpeech: 0.2,
        durationAfterSpeech: 0.3,
        characterVisible: true,
      },
    ],
  };
}

function createFileAccess(initial: Record<string, string>): ScriptFileAccess & {writes: Array<{path: string; data: string}>} {
  const files = new Map(Object.entries(initial));
  const writes: Array<{path: string; data: string}> = [];
  return {
    writes,
    async readFile(path) {
      const value = files.get(path);
      if (value === undefined) {
        const error = new Error('missing') as Error & {code: string};
        error.code = 'ENOENT';
        throw error;
      }
      return value;
    },
    async writeFile(path, data) {
      writes.push({path, data});
      files.set(path, data);
    },
  };
}

describe('script apply adapter', () => {
  it('builds canonical and backup paths', () => {
    expect(scriptPathFor('sample-video')).toBe('input/sample-video.json');
    expect(backupPathFor('sample-video')).toBe('input/sample-video.json.bak');
  });

  it('writes backup before canonical script', async () => {
    const existing = '{"old":true}';
    const fileAccess = createFileAccess({'input/sample-video.json': existing});

    const result = await applyScriptDraft('sample-video', formatScriptJson(createScript()), fileAccess);

    expect(result.status).toBe('applied');
    expect(fileAccess.writes.map((write) => write.path)).toEqual([
      'input/sample-video.json.bak',
      'input/sample-video.json',
    ]);
    expect(fileAccess.writes[0]?.data).toBe(existing);
    expect(fileAccess.writes[1]?.data).toContain('"title": "Sample"');
  });

  it('does not save canonical script when backup write fails', async () => {
    const writes: string[] = [];
    const fileAccess: ScriptFileAccess = {
      async readFile() {
        return '{"old":true}';
      },
      async writeFile(path) {
        writes.push(path);
        throw new Error('backup failed');
      },
    };

    const result = await applyScriptDraft('sample-video', formatScriptJson(createScript()), fileAccess);

    expect(result).toMatchObject({status: 'failed', error: {code: 'backup-failed'}});
    expect(writes).toEqual(['input/sample-video.json.bak']);
  });

  it('returns save-failed when canonical write fails after backup succeeds', async () => {
    const fileAccess: ScriptFileAccess = {
      async readFile() {
        return '{"old":true}';
      },
      async writeFile(path) {
        if (path.endsWith('.json')) {
          throw new Error('save failed');
        }
      },
    };

    const result = await applyScriptDraft('sample-video', formatScriptJson(createScript()), fileAccess);

    expect(result).toMatchObject({status: 'failed', error: {code: 'save-failed'}});
  });
});

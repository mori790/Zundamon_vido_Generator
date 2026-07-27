import {describe, expect, it} from 'vitest';
import {
  addDraftScene,
  createDraftFromScript,
  createEmptyScriptDraft,
  moveDraftScene,
  nextSceneId,
  removeDraftScene,
  updateDraftRawJson,
  updateDraftScene,
} from '../../src/studio/shared/script-draft';
import type {Scene, VideoScript} from '../../src/types/video';

function createScene(id: string): Scene {
  return {
    id,
    type: 'explanation',
    text: `${id} text`,
    emotion: 'normal',
    durationBeforeSpeech: 0.2,
    durationAfterSpeech: 0.3,
    characterVisible: true,
  };
}

function createScript(sceneCount = 2): VideoScript {
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
    scenes: Array.from({length: sceneCount}, (_, index) => createScene(`scene-${String(index + 1).padStart(3, '0')}`)),
  };
}

describe('script draft state', () => {
  it('creates a draft from existing script without mutating the active script', () => {
    const activeScript = createScript();
    const draft = createDraftFromScript('sample-video', activeScript);

    expect(draft.status).toBe('draft');
    expect(draft.lastValidScript?.title).toBe('Sample');
    expect(draft.rawJson).toContain('"id": "sample-video"');
    expect(draft.lastValidScript).not.toBe(activeScript);
  });

  it('creates a minimal draft for an empty workspace', () => {
    const draft = createEmptyScriptDraft('new-video');

    expect(draft.lastValidScript?.id).toBe('new-video');
    expect(draft.lastValidScript?.scenes).toHaveLength(1);
    expect(draft.validation.status).toBe('valid');
  });

  it('keeps last valid script when raw JSON is invalid', () => {
    const draft = createDraftFromScript('sample-video', createScript());
    const invalidDraft = updateDraftRawJson(draft, '{"id":');

    expect(invalidDraft.status).toBe('invalid');
    expect(invalidDraft.parsedScript).toBeNull();
    expect(invalidDraft.lastValidScript?.title).toBe('Sample');
    expect(invalidDraft.validation.errors[0]?.code).toBe('invalid-json');
  });

  it('edits, adds, removes, and moves scenes', () => {
    const draft = createDraftFromScript('sample-video', createScript());
    const edited = updateDraftScene(draft, 'scene-001', {text: '更新したのだ。'});
    const added = addDraftScene(edited, 'scene-001');
    const removed = removeDraftScene(added, 'scene-002');
    const moved = moveDraftScene(removed, 'scene-003', 'up');

    expect(edited.lastValidScript?.scenes[0]?.text).toBe('更新したのだ。');
    expect(added.lastValidScript?.scenes.map((scene) => scene.id)).toEqual(['scene-001', 'scene-003', 'scene-002']);
    expect(removed.lastValidScript?.scenes.map((scene) => scene.id)).toEqual(['scene-001', 'scene-003']);
    expect(moved.lastValidScript?.scenes.map((scene) => scene.id)).toEqual(['scene-003', 'scene-001']);
  });

  it('generates the next unused sequential scene id', () => {
    expect(nextSceneId([createScene('scene-001'), createScene('scene-003')])).toBe('scene-002');
  });

  it('handles a representative 100 scene draft', () => {
    const draft = createDraftFromScript('sample-video', createScript(100));
    const edited = updateDraftScene(draft, 'scene-100', {text: '100番目なのだ。'});

    expect(draft.lastValidScript?.scenes).toHaveLength(100);
    expect(edited.lastValidScript?.scenes[99]?.text).toBe('100番目なのだ。');
    expect(edited.rawJson).toContain('100番目なのだ。');
  });
});

import {describe, expect, it} from 'vitest';
import {
  addScene,
  finalizeScenes,
  moveScene,
  parseTags,
  removeScene,
  updateSceneField,
  type EditableScene,
} from '../../src/studio/renderer/scene-editing';

function makeScene(overrides: Partial<EditableScene> = {}): EditableScene {
  return {_key: 'k0', id: 'scene-001', title: 'タイトル', narration: 'ナレーション', tags: ['タグ'], ...overrides};
}

function makeScenes(count: number): EditableScene[] {
  return Array.from({length: count}, (_, i) => makeScene({
    _key: `k${i}`,
    id: `scene-${String(i + 1).padStart(3, '0')}`,
    title: `Scene ${i + 1}`,
  }));
}

describe('moveScene', () => {
  it('下方向に移動する', () => {
    const scenes = makeScenes(3);
    const result = moveScene(scenes, 0, 'down');
    expect(result[0].title).toBe('Scene 2');
    expect(result[1].title).toBe('Scene 1');
    expect(result[2].title).toBe('Scene 3');
  });

  it('上方向に移動する', () => {
    const scenes = makeScenes(3);
    const result = moveScene(scenes, 2, 'up');
    expect(result[1].title).toBe('Scene 3');
    expect(result[2].title).toBe('Scene 2');
  });

  it('先頭で上に移動しても変化しない', () => {
    const scenes = makeScenes(3);
    const result = moveScene(scenes, 0, 'up');
    expect(result).toBe(scenes);
  });

  it('末尾で下に移動しても変化しない', () => {
    const scenes = makeScenes(3);
    const result = moveScene(scenes, 2, 'down');
    expect(result).toBe(scenes);
  });
});

describe('addScene', () => {
  it('末尾に空のシーンを追加する', () => {
    const scenes = makeScenes(2);
    const result = addScene(scenes);
    expect(result).toHaveLength(3);
    expect(result[2].title).toBe('');
    expect(result[2].narration).toBe('');
    expect(result[2].tags).toEqual([]);
  });

  it('追加されたシーンの _key はユニークである', () => {
    const scenes = makeScenes(1);
    const r1 = addScene(scenes);
    const r2 = addScene(scenes);
    expect(r1[1]._key).not.toBe(scenes[0]._key);
    expect(r2[1]._key).not.toBe(scenes[0]._key);
  });
});

describe('removeScene', () => {
  it('指定インデックスのシーンを除去する', () => {
    const scenes = makeScenes(3);
    const result = removeScene(scenes, 1);
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Scene 1');
    expect(result[1].title).toBe('Scene 3');
  });

  it('0件になることも許容する', () => {
    const scenes = makeScenes(1);
    const result = removeScene(scenes, 0);
    expect(result).toHaveLength(0);
  });
});

describe('updateSceneField', () => {
  it('title を更新する', () => {
    const scenes = makeScenes(2);
    const result = updateSceneField(scenes, 0, 'title', '新しいタイトル');
    expect(result[0].title).toBe('新しいタイトル');
    expect(result[1].title).toBe('Scene 2');
  });

  it('narration を更新する', () => {
    const scenes = makeScenes(1);
    const result = updateSceneField(scenes, 0, 'narration', '新しいナレーション');
    expect(result[0].narration).toBe('新しいナレーション');
  });

  it('tags を string[] で更新する', () => {
    const scenes = makeScenes(1);
    const result = updateSceneField(scenes, 0, 'tags', ['春', '桜']);
    expect(result[0].tags).toEqual(['春', '桜']);
  });
});

describe('finalizeScenes', () => {
  it('ID を scene-001 から順に割り当てる', () => {
    const scenes = makeScenes(3);
    const result = finalizeScenes(scenes);
    expect(result[0].id).toBe('scene-001');
    expect(result[1].id).toBe('scene-002');
    expect(result[2].id).toBe('scene-003');
  });

  it('_key を含まない', () => {
    const scenes = makeScenes(2);
    const result = finalizeScenes(scenes);
    expect('_key' in result[0]).toBe(false);
    expect('_key' in result[1]).toBe(false);
  });

  it('title / narration を trim し、空タグを除去する', () => {
    const scenes = [makeScene({title: '  タイトル  ', narration: '  ナレーション  ', tags: ['  春  ', '', '  ']})];
    const result = finalizeScenes(scenes);
    expect(result[0].title).toBe('タイトル');
    expect(result[0].narration).toBe('ナレーション');
    expect(result[0].tags).toEqual(['春']);
  });
});

describe('parseTags', () => {
  it('カンマ区切り文字列を string[] に変換する', () => {
    expect(parseTags('桜, 春, 明るい')).toEqual(['桜', '春', '明るい']);
  });

  it('空文字列で空配列を返す', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('余分なスペースを trim する', () => {
    expect(parseTags('  タグA  ,  タグB  ')).toEqual(['タグA', 'タグB']);
  });
});

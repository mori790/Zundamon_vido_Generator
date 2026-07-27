import {useState} from 'react';
import type {Scene, SceneDraft} from '../shared/scene-segmentation';
import type {LocalFileApi} from '../shared/local-file';
import {
  type EditableScene,
  addScene,
  finalizeScenes,
  moveScene,
  parseTags,
  removeScene,
  updateSceneField,
} from './scene-editing';
import {SceneCard} from './SceneCard';

declare global {
  var localFileApi: LocalFileApi | undefined;
}

type Props = {
  scenes: Scene[];
  videoId: string | null;
  initialDraftText: string;
  initialSegmentedAt: string | null;
  onConfirm(scenes: Scene[]): void;
};

export function SceneListTab({scenes, videoId, initialDraftText, initialSegmentedAt, onConfirm}: Props): JSX.Element {
  const [editableScenes, setEditableScenes] = useState<EditableScene[]>(() =>
    scenes.map((s, i) => ({...s, _key: `init-${i}`}))
  );
  const [saving, setSaving] = useState(false);

  function handleAdd() {
    setEditableScenes((prev) => addScene(prev));
  }

  function handleMoveUp(index: number) {
    setEditableScenes((prev) => moveScene(prev, index, 'up'));
  }

  function handleMoveDown(index: number) {
    setEditableScenes((prev) => moveScene(prev, index, 'down'));
  }

  function handleRemove(index: number) {
    setEditableScenes((prev) => removeScene(prev, index));
  }

  function handleSceneChange(index: number, field: 'title' | 'narration' | 'tags', value: string) {
    const resolved = field === 'tags' ? parseTags(value) : value;
    setEditableScenes((prev) => updateSceneField(prev, index, field, resolved));
  }

  function handleConfirm() {
    if (saving) return;
    setSaving(true);
    const finalScenes = finalizeScenes(editableScenes);

    const localApi = globalThis.localFileApi;
    if (localApi && videoId) {
      const sceneDraft: SceneDraft = {
        draftText: initialDraftText,
        savedAt: new Date().toISOString(),
        scenes: finalScenes,
        segmentedAt: initialSegmentedAt,
      };
      localApi.draft.write(videoId, JSON.stringify(sceneDraft)).catch((err: unknown) => {
        console.error('[SceneListTab] SceneDraft save error', err);
      });
    }

    setSaving(false);
    onConfirm(finalScenes);
  }

  return (
    <section className="scene-list-tab" data-testid="scene-list-tab">
      <h2>シーン調整</h2>
      <p className="muted">{editableScenes.length}件のシーンを確認・編集してください。</p>
      <div className="scene-list">
        {editableScenes.map((scene, index) => (
          <SceneCard
            index={index}
            key={scene._key}
            onChange={(field, value) => handleSceneChange(index, field, value)}
            onMoveDown={() => handleMoveDown(index)}
            onMoveUp={() => handleMoveUp(index)}
            onRemove={() => handleRemove(index)}
            scene={scene}
            total={editableScenes.length}
          />
        ))}
      </div>
      <div className="scene-list-controls" style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
        <button onClick={handleAdd} type="button">
          + シーンを追加
        </button>
        <button
          disabled={editableScenes.length === 0 || saving}
          onClick={handleConfirm}
          type="button"
        >
          {saving ? '保存中...' : '完了'}
        </button>
      </div>
    </section>
  );
}

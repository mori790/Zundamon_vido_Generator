import type {EditableScene} from './scene-editing';

type Props = {
  scene: EditableScene;
  index: number;
  total: number;
  onChange(field: 'title' | 'narration' | 'tags', value: string): void;
  onMoveUp(): void;
  onMoveDown(): void;
  onRemove(): void;
};

export function SceneCard({scene, index, total, onChange, onMoveUp, onMoveDown, onRemove}: Props): JSX.Element {
  const displayId = scene.id || `#${index + 1}`;

  return (
    <article className="scene-card" data-testid={`scene-card-${index}`}>
      <header className="scene-card-header">
        <span className="scene-id">{displayId}</span>
        <div className="scene-card-actions">
          <button
            aria-label="上へ移動"
            disabled={index === 0}
            onClick={onMoveUp}
            type="button"
          >▲</button>
          <button
            aria-label="下へ移動"
            disabled={index === total - 1}
            onClick={onMoveDown}
            type="button"
          >▼</button>
          <button
            aria-label={`シーン${index + 1}を削除`}
            onClick={onRemove}
            type="button"
          >削除</button>
        </div>
      </header>
      <label className="field-label">
        タイトル
        <input
          onChange={(e) => onChange('title', e.target.value)}
          type="text"
          value={scene.title}
        />
      </label>
      <label className="field-label">
        ナレーション
        <textarea
          onChange={(e) => onChange('narration', e.target.value)}
          value={scene.narration}
        />
      </label>
      <label className="field-label">
        タグ（カンマ区切り）
        <input
          onChange={(e) => onChange('tags', e.target.value)}
          type="text"
          value={scene.tags.join(', ')}
        />
      </label>
    </article>
  );
}

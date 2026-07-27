# Component Design: U12-C シーン調整UI

## コンポーネント階層

```
StudioApp
└── StudioContent
    ├── tabBar（シーン調整タブを追加）
    ├── [activeTab === 'scenes'] SceneListTab    ← NEW
    │   ├── [each scene] SceneCard               ← NEW
    │   └── SceneListControls（インライン）
    └── [activeTab === 'asset-assign'] AssetAssignPlaceholder  ← NEW
```

## 新規コンポーネント

### `SceneListTab`

**場所**: `src/studio/renderer/SceneListTab.tsx`

**Props**:
```typescript
type Props = {
  scenes: Scene[];
  videoId: string | null;
  initialDraftText: string;
  initialSegmentedAt: string | null;
  onConfirm(scenes: Scene[]): void;
};
```

**状態**:
- `editableScenes: EditableScene[]` — 編集中のシーン配列
- `saving: boolean` — 完了ボタン押下中フラグ

**レンダリング構造**:
```
<section className="scene-list-tab" data-testid="scene-list-tab">
  <h2>シーン調整</h2>
  <p className="muted">{editableScenes.length}件のシーンを確認・編集してください。</p>
  <div className="scene-list">
    {editableScenes.map((scene, index) => (
      <SceneCard key={scene._key} ... />
    ))}
  </div>
  <div className="scene-list-controls">
    <button onClick={handleAdd}>+ シーンを追加</button>
    <button
      disabled={editableScenes.length === 0 || saving}
      onClick={handleConfirm}
    >
      {saving ? '保存中...' : '完了'}
    </button>
  </div>
</section>
```

---

### `SceneCard`

**場所**: `src/studio/renderer/SceneCard.tsx`

**Props**:
```typescript
type Props = {
  scene: EditableScene;
  index: number;
  total: number;
  onChange(field: 'title' | 'narration' | 'tags', value: string): void;
  onMoveUp(): void;
  onMoveDown(): void;
  onRemove(): void;
};
```

`onChange` の `value` は常に文字列（tags もカンマ区切り文字列として受け取り、コンポーネント内で parseTags しない。親が担う）。

**レンダリング構造**:
```
<article className="scene-card" data-testid={`scene-card-${index}`}>
  <header className="scene-card-header">
    <span className="scene-id">{scene.id || `#${index + 1}`}</span>
    <div className="scene-card-actions">
      <button disabled={index === 0} onClick={onMoveUp} aria-label="上へ移動">▲</button>
      <button disabled={index === total - 1} onClick={onMoveDown} aria-label="下へ移動">▼</button>
      <button onClick={onRemove} aria-label="シーンを削除">削除</button>
    </div>
  </header>
  <label>タイトル
    <input value={scene.title} onChange={(e) => onChange('title', e.target.value)} />
  </label>
  <label>ナレーション
    <textarea value={scene.narration} onChange={(e) => onChange('narration', e.target.value)} />
  </label>
  <label>タグ（カンマ区切り）
    <input value={scene.tags.join(', ')} onChange={(e) => onChange('tags', e.target.value)} />
  </label>
</article>
```

- `scene.id` が空（新規追加シーン）の場合は `#${index + 1}` を仮表示する。
- tags の `value` は `scene.tags.join(', ')` で表示、onChange では文字列をそのまま `onChange('tags', value)` で渡す。

---

### `AssetAssignPlaceholder`

**場所**: `src/studio/renderer/StudioApp.tsx` 内（インライン関数コンポーネント）

```typescript
function AssetAssignPlaceholder({count}: {count: number}): JSX.Element {
  return (
    <main className="studio-shell">
      <section className="workspace-card" data-testid="asset-assign-placeholder">
        <h2>素材割り当て</h2>
        <p className="muted">シーン調整が完了しました（{count}件）。</p>
        <p className="muted">U12-D 実装後に素材割り当てUIが表示されます。</p>
      </section>
    </main>
  );
}
```

## StudioApp への変更

1. `MainTab` 型に `'asset-assign'` を追加: `'workspace' | 'text-input' | 'scenes' | 'asset-assign'`
2. `initialDraftText` と `initialSegmentedAt` を `scenes` と並べて状態として管理する（SceneDraft から取得）。
3. `onSegmentationComplete` で SceneDraft から `draftText` と `segmentedAt` も保存する。
4. `activeTab === 'scenes'` のとき: `SceneListTab` をレンダリングする（`ScenePlaceholder` を置き換え）。
5. `activeTab === 'asset-assign'` のとき: `AssetAssignPlaceholder` をレンダリングする。
6. `onConfirm(finalScenes)` で `setScenes(finalScenes)` + `setActiveTab('asset-assign')`。

## 新規 IPC チャンネル

U12-C では新規 IPC チャンネルは不要。SceneDraft 保存は既存の `local-file:write-draft` を引き続き使用する。

## tags 変換のデータフロー

```
SceneCard onChange('tags', '桜, 春, 明るい')
  → SceneListTab.handleSceneChange(index, 'tags', '桜, 春, 明るい')
    → parseTags('桜, 春, 明るい') → ['桜', '春', '明るい']
    → updateSceneField(scenes, index, 'tags', ['桜', '春', '明るい'])
    → setEditableScenes(next)
```

SceneCard は tags を `string[]` ではなくカンマ区切り文字列として受け取り、`onChange` で生文字列を渡す。`parseTags` は `SceneListTab` 側でのみ呼び出す。

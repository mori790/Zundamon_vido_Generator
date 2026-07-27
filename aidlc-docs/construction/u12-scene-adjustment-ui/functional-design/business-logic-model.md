# Business Logic Model: U12-C シーン調整UI

## シーン編集の純粋関数

すべてのシーン操作は `EditableScene[]` を受け取り、新しい `EditableScene[]` を返す純粋関数として実装する。副作用なし。

### `moveScene(scenes, index, direction)`

```typescript
function moveScene(scenes: EditableScene[], index: number, direction: 'up' | 'down'): EditableScene[] {
  const next = [...scenes];
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= next.length) return scenes;  // 境界チェック
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}
```

- 先頭シーンの「▲ 上へ」ボタンは disabled。
- 末尾シーンの「▼ 下へ」ボタンは disabled。

### `addScene(scenes)`

```typescript
function addScene(scenes: EditableScene[]): EditableScene[] {
  const _key = `new-${scenes.length}-${Math.random().toString(36).slice(2)}`;
  return [...scenes, {_key, id: '', title: '', narration: '', tags: []}];
}
```

- 末尾に空のシーンを追加する。
- `_key` は React key として一意になれば何でもよい（Date.now 回避のため length+random を使用）。

### `removeScene(scenes, index)`

```typescript
function removeScene(scenes: EditableScene[], index: number): EditableScene[] {
  return scenes.filter((_, i) => i !== index);
}
```

- 削除後のシーン数が 0 になることも許容する（空状態では「完了」ボタンを disabled にする）。

### `updateSceneField(scenes, index, field, value)`

```typescript
function updateSceneField(
  scenes: EditableScene[],
  index: number,
  field: 'title' | 'narration' | 'tags',
  value: string | string[],
): EditableScene[] {
  return scenes.map((s, i) => i === index ? {...s, [field]: value} : s);
}
```

tags の更新は `value: string[]` を渡す。呼び出し側でカンマ split を行う。

### `finalizeScenes(scenes)`

```typescript
function finalizeScenes(scenes: EditableScene[]): Scene[] {
  return scenes.map((s, i) => ({
    id: `scene-${String(i + 1).padStart(3, '0')}`,
    title: s.title.trim(),
    narration: s.narration.trim(),
    tags: s.tags.map((t) => t.trim()).filter(Boolean),
  }));
}
```

- `_key` を除去し、ID を現在の配列順序で再割り当てする。
- title / narration / tags 要素を trim し、空タグを除去する。

## Tags カンマ分割ロジック

```typescript
function parseTags(input: string): string[] {
  return input.split(',').map((t) => t.trim()).filter(Boolean);
}
```

- tags input の `onChange` では `parseTags(event.target.value)` を呼び出して `string[]` に変換する。
- tags input の `value` 表示は `tags.join(', ')` で文字列に戻す。

## 完了フロー

1. `finalizeScenes(editableScenes)` を呼び出して `Scene[]` を確定する。
2. 確定後の scenes と既存の SceneDraft 情報（draftText, segmentedAt）を組み合わせて新しい SceneDraft を生成する。
3. `localFileApi.draft.write(videoId, JSON.stringify(sceneDraft))` で非同期保存（Fail-Open）。
4. `onConfirm(finalScenes)` コールバックを呼び出す。
5. StudioApp が `scenes` 状態を更新し、`activeTab` を `'asset-assign'` に切り替える。

## 「完了」ボタン有効条件

```
editableScenes.length > 0 && !saving
```

- シーンが 0 件のときは「完了」ボタンを disabled にする。
- 保存中（saving フラグ）は「完了」ボタンを disabled にする。

## 初期化

SceneListTab mount 時に `scenes: Scene[]` props を `EditableScene[]` に変換してローカル状態を初期化する。

```typescript
const [editableScenes, setEditableScenes] = useState<EditableScene[]>(() =>
  scenes.map((s, i) => ({...s, _key: `init-${i}`}))
);
```

`useState` の初期化関数（lazy initializer）として定義し、再 mount 時に props の変化を反映しない（意図的 - 編集中の変更を保護する）。

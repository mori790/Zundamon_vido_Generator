# Logical Components: U12-C シーン調整UI

## `scene-editing.ts`（純粋関数層）

- **場所**: `src/studio/renderer/scene-editing.ts`
- **目的**: `EditableScene` 型定義と全シーン操作純粋関数を提供する。React・DOM 不使用。
- **エクスポート**:

| 名前 | シグネチャ | 役割 |
|---|---|---|
| `EditableScene` | `Scene & {_key: string}` | 編集中シーンの型。`_key` は React key 用。 |
| `moveScene` | `(scenes, index, 'up'\|'down') → EditableScene[]` | 隣接要素と swap。境界外なら元の配列を返す。 |
| `addScene` | `(scenes) → EditableScene[]` | 末尾に空シーンを追加。`_key` は `new-${length}-${randomHex}` で生成。 |
| `removeScene` | `(scenes, index) → EditableScene[]` | index を filter で除去。 |
| `updateSceneField` | `(scenes, index, field, value) → EditableScene[]` | 指定フィールドを map で更新。 |
| `finalizeScenes` | `(scenes) → Scene[]` | `_key` 除去、ID 再割り当て（scene-001…）、trim 適用。 |
| `parseTags` | `(input: string) → string[]` | カンマ split → trim → filter(Boolean)。 |

- **NFR 役割**: ロジック抽出パターン。Vitest 単体テスト（`tests/studio/scene-editing.test.ts`）で全関数をカバーする。

## `SceneListTab`（Renderer 層）

- **場所**: `src/studio/renderer/SceneListTab.tsx`
- **目的**: シーン一覧の表示・編集を管理し、完了時に finalizeScenes → SceneDraft 保存 → `onConfirm` 呼び出しを行う。
- **Props**:

```typescript
type Props = {
  scenes: Scene[];
  videoId: string | null;
  initialDraftText: string;
  initialSegmentedAt: string | null;
  onConfirm(scenes: Scene[]): void;
};
```

- **状態**:
  - `editableScenes: EditableScene[]` — `useState(() => scenes.map((s, i) => ({...s, _key: \`init-\${i}\`})))` で初期化（lazy）
  - `saving: boolean` — 保存中フラグパターン

- **ハンドラ**:
  - `handleAdd()` → `addScene(editableScenes)` → `setEditableScenes`
  - `handleMoveUp(i)` → `moveScene(editableScenes, i, 'up')` → `setEditableScenes`
  - `handleMoveDown(i)` → `moveScene(editableScenes, i, 'down')` → `setEditableScenes`
  - `handleRemove(i)` → `removeScene(editableScenes, i)` → `setEditableScenes`
  - `handleSceneChange(i, field, value: string)` → field === 'tags' ? `parseTags(value)` : value → `updateSceneField` → `setEditableScenes`
  - `handleConfirm()` (async) → Fail-Open 保存パターン + `onConfirm(finalScenes)`

- **グローバル参照**: `declare global { var localFileApi: LocalFileApi | undefined; }` （TextInputTab と同様）
- **NFR 役割**: 保存中フラグパターン（saving 状態）、Fail-Open 保存パターン（write の .catch）。

## `SceneCard`（Renderer 層）

- **場所**: `src/studio/renderer/SceneCard.tsx`
- **目的**: 1シーン分の編集フォーム。ボタンイベントを親にコールバックで委譲する。
- **Props**:

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

- `onChange` は常に文字列を渡す（`parseTags` は呼び出し側 SceneListTab が担う）。
- `tags` 表示は `scene.tags.join(', ')`。
- `scene.id` が空（新規追加シーン）の場合は `#${index + 1}` を仮表示する。
- **NFR 役割**: アクセシビリティパターン（aria-label / disabled / type="button"）。

## `AssetAssignPlaceholder`（Renderer 層）

- **場所**: `src/studio/renderer/StudioApp.tsx` 内のインライン関数コンポーネント
- **目的**: U12-D 実装前の placeholder。`count` prop でシーン件数を表示する。
- **NFR 役割**: なし（表示のみ）。

## StudioApp への変更点

- `MainTab` に `'asset-assign'` を追加する。
- `sceneDraftMeta: { draftText: string; segmentedAt: string | null } | null` 状態を追加する（`onSegmentationComplete` 時に SceneDraft から取得）。
- `onSegmentationComplete` の受け取り時: TextInputTab で保存した SceneDraft のメタ情報を `initialDraftText` / `initialSegmentedAt` として保持する（シーン数のみでなく draftText も state で管理する）。
- `activeTab === 'scenes'`: `SceneListTab` をレンダリングする（`ScenePlaceholder` を置き換え）。
- `activeTab === 'asset-assign'`: `AssetAssignPlaceholder` をレンダリングする。

### `sceneDraftMeta` の保持方法

`onSegmentationComplete` は U12-B の TextInputTab から `Scene[]` を受け取る。`draftText` は TextInputTab の状態にあるが StudioApp からは直接参照できない。

解決: `onSegmentationComplete` のシグネチャを変更して `draftText` と `segmentedAt` も渡す。

```typescript
// StudioApp 内
onSegmentationComplete={(newScenes, meta) => {
  setScenes(newScenes);
  setSceneDraftMeta(meta);
  setActiveTab('scenes');
}}

// TextInputTab 内（handleSegmentationStart 末尾）
onSegmentationComplete(segResult.scenes, {
  draftText: currentText,
  segmentedAt: new Date().toISOString(),
});
```

`SceneListTab` に `initialDraftText` と `initialSegmentedAt` を Props として渡すことで、SceneDraft の保存時に元の草案テキストを引き継げる。

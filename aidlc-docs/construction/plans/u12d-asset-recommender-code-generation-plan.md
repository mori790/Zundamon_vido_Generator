# Code Generation Plan: U12-D 素材割り当て

## 変更ファイル一覧

| # | ファイル | 操作 |
|---|---|---|
| 1 | `src/studio/shared/scene-segmentation.ts` | 編集（`SceneWithAsset` 型追加） |
| 2 | `src/studio/renderer/SceneAssetCard.tsx` | 新規作成 |
| 3 | `src/studio/renderer/AssetAssignTab.tsx` | 新規作成 |
| 4 | `src/studio/renderer/StudioApp.tsx` | 編集（4箇所） |

## 実装手順

### ステップ 1: `SceneWithAsset` 型追加

`src/studio/shared/scene-segmentation.ts` の末尾（`parseSegmentationResponse` の後）に追加:
```typescript
export type SceneWithAsset = Scene & {
  assetPublicPath: string | null;
  assetFileName: string | null;
};
```

### ステップ 2: `SceneAssetCard.tsx` 新規作成

Props:
```typescript
type Props = {
  scene: SceneWithAsset;
  index: number;
  isLoading: boolean;
  disabled: boolean;
  error: string | null;
  onAssign(): void;
  onClear(): void;
};
```

- ナレーションプレビュー: `scene.narration.slice(0, 60) + (scene.narration.length > 60 ? '…' : '')`
- 「素材を選択」ボタン: `disabled={disabled}` / `isLoading` 時は「選択中...」
- 割り当て済み: `assetFileName` 表示 + 「クリア」ボタン / 未割り当て: `<span className="muted">未割り当て</span>`
- `data-testid={`scene-asset-card-${index}`}`

### ステップ 3: `AssetAssignTab.tsx` 新規作成

Props:
```typescript
type Props = {
  initialScenes: Scene[];
  videoId: string | null;
  onConfirm(scenes: SceneWithAsset[]): void;
};
```

状態:
```typescript
const [scenes, setScenes] = useState<SceneWithAsset[]>(() =>
  initialScenes.map((s) => ({...s, assetPublicPath: null, assetFileName: null}))
);
const [errors, setErrors] = useState<Record<number, string>>({});
const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
```

`handleAssign(index: number)` (ローディングインデックスパターン + エラー自動クリアパターン + Overwrite-Always パターン):
1. `if (loadingIndex !== null) return;`
2. エラークリア: `setErrors(prev => { const next = {...prev}; delete next[index]; return next; })`
3. `setLoadingIndex(index)`
4. `try { ... } finally { setLoadingIndex(null); }`
5. try内: `asset.select()` → null ならキャンセル(return) → `asset.copy(videoId!, token, true)` → status==='failed' ならエラー設定 → 成功(copied/replacement-required)なら `setScenes` 更新

`handleClear(index: number)`:
- `assetPublicPath: null, assetFileName: null` に更新 + `errors[index]` を除去

`declare global { var localFileApi: LocalFileApi | undefined; }` をコンポーネントファイル内に配置。

assigned/total カウント表示: `{scenes.filter(s => s.assetPublicPath !== null).length}件 / {scenes.length}件 割り当て済み`

「次へ（JSON生成）」ボタン: `onClick={() => onConfirm(scenes)}`

`data-testid="asset-assign-tab"`

### ステップ 4: `StudioApp.tsx` 編集（4箇所）

**4-A: 型追加 + import**
- `import {AssetAssignTab} from './AssetAssignTab'` を追加
- `import type {SceneWithAsset} from '../shared/scene-segmentation'` を追加
- `type MainTab = 'workspace' | 'text-input' | 'scenes' | 'asset-assign' | 'json-generate'` に変更

**4-B: `scenesWithAssets` state 追加**（StudioContent 内、`sceneDraftMeta` の後）
```typescript
const [scenesWithAssets, setScenesWithAssets] = useState<SceneWithAsset[] | null>(null);
```

**4-C: タブバーに「JSON生成」タブ追加**（「素材割り当て」ボタンの後）
```tsx
<button
  aria-selected={activeTab === 'json-generate'}
  data-testid="tab-json-generate"
  disabled={!scenesWithAssets}
  onClick={() => setActiveTab('json-generate')}
  role="tab"
  type="button"
>
  JSON生成
</button>
```

**4-D: asset-assign render の置き換え + json-generate render 追加**

「素材割り当て」ブロック (`activeTab === 'asset-assign' && scenes`) の render を変更:
- `AssetAssignPlaceholder` → `AssetAssignTab`
```tsx
<AssetAssignTab
  initialScenes={scenes}
  videoId={workspace?.videoId ?? null}
  onConfirm={(result) => {
    setScenesWithAssets(result);
    setActiveTab('json-generate');
  }}
/>
```

「json-generate」render を `asset-assign` ブロックの前に追加:
```tsx
if (activeTab === 'json-generate' && scenesWithAssets) {
  return (
    <>
      {tabBar}
      <JsonGeneratePlaceholder count={scenesWithAssets.length} />
    </>
  );
}
```

`AssetAssignPlaceholder` 関数を `JsonGeneratePlaceholder` に置き換え:
```typescript
function JsonGeneratePlaceholder({count}: {count: number}): JSX.Element {
  return (
    <main className="studio-shell">
      <section className="workspace-card" data-testid="json-generate-placeholder">
        <h2>JSON生成</h2>
        <p className="muted">素材割り当てが完了しました（{count}件）。</p>
        <p className="muted">U12-E 実装後に VideoScript JSON 生成UIが表示されます。</p>
      </section>
    </main>
  );
}
```

## ビルド・テスト

```bash
npx tsc --noEmit && npm test && npm run studio:build
```

期待結果:
- 型エラーなし
- 既存テスト全通過（テスト追加なし）
- Electron ビルド成功

# Component Design: U12-D 素材割り当て

## コンポーネント階層

```
StudioApp
└── StudioContent
    ├── tabBar（素材割り当てタブは既存、JSON生成タブを追加）
    ├── [activeTab === 'asset-assign'] AssetAssignTab       ← 既存 placeholder を置き換え
    │   └── [each scene] SceneAssetCard                    ← NEW
    └── [activeTab === 'json-generate'] JsonGeneratePlaceholder  ← NEW（U12-E placeholder）
```

## 新規コンポーネント

### `AssetAssignTab`

**場所**: `src/studio/renderer/AssetAssignTab.tsx`

**Props**:
```typescript
type Props = {
  initialScenes: Scene[];
  videoId: string | null;
  onConfirm(scenes: SceneWithAsset[]): void;
};
```

**状態**:
- `scenes: SceneWithAsset[]` — 素材割り当て中のシーン配列
- `errors: Record<number, string>` — index をキーにしたエラーメッセージ

**レンダリング構造**:
```
<section className="asset-assign-tab" data-testid="asset-assign-tab">
  <h2>素材割り当て</h2>
  <p className="muted">
    {assigned}件 / {total}件 割り当て済み
  </p>
  <div className="scene-asset-list">
    {scenes.map((scene, index) => (
      <SceneAssetCard
        key={scene.id}
        error={errors[index] ?? null}
        index={index}
        onAssign={() => handleAssign(index)}
        onClear={() => handleClear(index)}
        scene={scene}
        videoId={videoId}
      />
    ))}
  </div>
  <div style={{marginTop: '16px'}}>
    <button onClick={() => onConfirm(scenes)} type="button">
      次へ（JSON生成）
    </button>
  </div>
</section>
```

**ハンドラ**:
- `handleAssign(index)` (async): `asset.select()` → `asset.copy(videoId, token, true)` → 状態更新 or エラー設定
- `handleClear(index)`: `assetPublicPath: null, assetFileName: null` に更新 + errors[index] クリア

---

### `SceneAssetCard`

**場所**: `src/studio/renderer/SceneAssetCard.tsx`

**Props**:
```typescript
type Props = {
  scene: SceneWithAsset;
  index: number;
  videoId: string | null;
  error: string | null;
  onAssign(): void;
  onClear(): void;
};
```

**レンダリング構造**:
```
<article className="scene-asset-card" data-testid={`scene-asset-card-${index}`}>
  <header>
    <span className="scene-id">{scene.id}</span>
    <span className="scene-title">{scene.title || '（タイトルなし）'}</span>
  </header>
  <p className="scene-narration-preview">{narrationPreview}</p>
  <div className="asset-assignment">
    {scene.assetPublicPath ? (
      <>
        <span className="asset-file-name">{scene.assetFileName}</span>
        <button onClick={onClear} type="button">クリア</button>
      </>
    ) : (
      <span className="muted">未割り当て</span>
    )}
    <button
      disabled={!videoId}
      onClick={onAssign}
      type="button"
    >
      素材を選択
    </button>
  </div>
  {error ? <p className="error-banner">{error}</p> : null}
</article>
```

- `narrationPreview`: `scene.narration.slice(0, 60) + (scene.narration.length > 60 ? '…' : '')`
- `videoId` が null のとき「素材を選択」ボタンを disabled にする。

---

### `JsonGeneratePlaceholder`（StudioApp 内インライン）

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

## StudioApp への変更

1. `AssetAssignTab` を import する（`AssetAssignPlaceholder` を置き換え）。
2. `MainTab` 型に `'json-generate'` を追加する: `'workspace' | 'text-input' | 'scenes' | 'asset-assign' | 'json-generate'`
3. `StudioContent` に `scenesWithAssets: SceneWithAsset[] | null` 状態を追加する。
4. `activeTab === 'asset-assign'` の render に `AssetAssignTab` を渡す（`AssetAssignPlaceholder` を削除）。
5. `activeTab === 'json-generate'` の render に `JsonGeneratePlaceholder` を追加する。
6. タブバーに「JSON生成」タブを追加する（`disabled={!scenesWithAssets}`）。
7. `SceneListTab.onConfirm` の後: `setScenes(finalScenes)` → `setActiveTab('asset-assign')`（変更なし）。
8. `AssetAssignTab.onConfirm` の後: `setScenesWithAssets(result)` → `setActiveTab('json-generate')`。

## 新規 IPC チャンネル

なし。`local-file:select-asset` と `local-file:copy-asset` は U5 実装済みのものを再利用する。

## `globalThis.localFileApi` の使用

`AssetAssignTab` はコンポーネント内で `declare global { var localFileApi: LocalFileApi | undefined; }` を宣言して `globalThis.localFileApi?.asset.select()` を呼び出す。

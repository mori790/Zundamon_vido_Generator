# Business Logic Model: U12-D 素材割り当て

## 素材選択フロー（シーンごと）

```
1. ユーザーが「素材を選択」ボタンをクリック
2. asset.select() → LocalAssetSelection | null
   - null（キャンセル）: 何もしない
3. asset.copy(videoId, token, overwrite=true) → AssetCopyResult
   - 'copied': publicPath を sceneWithAsset.assetPublicPath に設定
   - 'replacement-required': publicPath を sceneWithAsset.assetPublicPath に設定
     （overwrite=true のため通常このケースは発生しない）
   - 'failed': エラーメッセージを表示、状態は変更しない
4. 状態更新: setScenes で対象シーンの assetPublicPath と assetFileName を更新
```

## 素材クリアフロー

```
ユーザーが「クリア」ボタンをクリック
→ 対象シーンの assetPublicPath を null に、assetFileName を null に更新
※ ファイルは削除しない（asset.trash は呼ばない）
```

## 初期化

`AssetAssignTab` mount 時に `Scene[]` を `SceneWithAsset[]` に変換してローカル状態を初期化する。

```typescript
const [scenes, setScenes] = useState<SceneWithAsset[]>(() =>
  initialScenes.map((s) => ({...s, assetPublicPath: null, assetFileName: null}))
);
```

lazy initializer で一度だけ初期化する。

## 「次へ（JSON生成）」ボタン

- 常に enabled（未割り当てシーンがあっても「次へ」を許可）。
- クリックで `onConfirm(scenes)` を呼び出す。
- StudioContent が `SceneWithAsset[]` を状態に保存し、`activeTab` を `'json-generate'` に切り替える。

## エラー状態

素材コピー失敗（`AssetCopyResult.status === 'failed'`）のとき:
- 対象シーンカードにエラーメッセージを表示する。
- 他のシーンへの影響はない。
- ユーザーが「素材を選択」を再クリックして再試行できる。

## 割り当て確認カウント（UI情報）

`scenes.filter(s => s.assetPublicPath !== null).length` を `AssetAssignTab` のヘッダーに表示する:
「{assigned}件 / {total}件 割り当て済み」

## データフロー

```
U12-C
  onConfirm(Scene[]) → StudioContent.setScenes(scenes) + setActiveTab('asset-assign')

U12-D AssetAssignTab
  mount: scenes → SceneWithAsset[]（assetPublicPath: null）
  ユーザー操作: setScenes（assetPublicPath を更新）
  onConfirm(SceneWithAsset[]) → StudioContent.setScenesWithAssets(scenesWithAssets)
                                → setActiveTab('json-generate')

U12-E
  scenesWithAssets を受け取り VideoScript JSON を生成
```

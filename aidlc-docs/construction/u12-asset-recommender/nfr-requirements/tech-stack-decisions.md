# Tech Stack Decisions: U12-D 素材割り当て

## 新規 npm 依存

**なし。** 画像サムネイル（Q4 B）を選択しないため canvas ライブラリ等は不要。

## 新規 IPC チャンネル

**なし。** `local-file:select-asset` と `local-file:copy-asset` は U5 実装済みのものを使用する。

## 型追加

`SceneWithAsset` を `src/studio/shared/scene-segmentation.ts` に追加する（新規ファイルは作成しない）。

```typescript
// src/studio/shared/scene-segmentation.ts に追加
export type SceneWithAsset = Scene & {
  assetPublicPath: string | null;
  assetFileName: string | null;
};
```

## 状態管理

| 状態 | 型 | 場所 |
|---|---|---|
| `scenes` | `SceneWithAsset[]` | `AssetAssignTab` ローカル state |
| `errors` | `Record<number, string>` | `AssetAssignTab` ローカル state |
| `loadingIndex` | `number \| null` | `AssetAssignTab` ローカル state |
| `scenesWithAssets` | `SceneWithAsset[] \| null` | `StudioContent` state（U12-E へ引き継ぎ） |

## 既存 API の使用方法

```typescript
// asset.select() が返す LocalAssetSelection
const selection = await globalThis.localFileApi?.asset.select();
// → {token: string; fileName: string; bytes: Uint8Array} | null

// asset.copy() に token を渡してワークスペースにコピー
const result = await globalThis.localFileApi?.asset.copy(videoId, selection.token, true);
// → AssetCopyResult = {status: 'copied'; publicPath: string} | ...
```

`publicPath` の形式: `/visuals/{videoId}/{fileName}`（`buildPublicVisualPath` が生成）

## テストフレームワーク

追加テストなし。

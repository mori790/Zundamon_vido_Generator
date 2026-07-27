# Domain Entities: U12-D 素材割り当て

## 既存型（参照）

```typescript
// src/studio/shared/asset.ts
type AssetCopyResult =
  | {status: 'copied'; publicPath: string}
  | {status: 'replacement-required'; publicPath: string}
  | {status: 'failed'; message: string};

// src/studio/shared/local-file.ts
type LocalAssetSelection = {token: string; fileName: string; bytes: Uint8Array};
type LocalFileApi.asset = {
  select(): Promise<LocalAssetSelection | null>;
  copy(videoId: string, token: string, overwrite: boolean): Promise<AssetCopyResult>;
  ...
};
```

## 新規型（U12-D で定義）

### `SceneWithAsset`

```typescript
// src/studio/shared/scene-segmentation.ts に追加
export type SceneWithAsset = Scene & {
  assetPublicPath: string | null;  // 割り当て済み素材のパス。未割り当ては null。
  assetFileName: string | null;    // ファイル名（UIでの表示用）。
};
```

**publicPath の形式**: `/visuals/{videoId}/{fileName}`（`buildPublicVisualPath` で生成）

**型の継承**: `SceneWithAsset` は `Scene` の全フィールド（id / title / narration / tags）を継承する。U12-E で VideoScript JSON を生成するときに `assetPublicPath` を参照する。

## 素材割り当て状態遷移

```
[U12-C 完了 Scene[]]
    ↓ AssetAssignTab mount
SceneWithAsset[]（全シーン assetPublicPath: null）
    ↓ ユーザーが各シーンへ素材を選択
SceneWithAsset[]（一部または全部に publicPath が設定）
    ↓ 「次へ（JSON生成）」ボタン
SceneWithAsset[]（U12-E へ引き継ぎ）
```

## 制約

- 対応素材形式: `.png` / `.jpg` / `.jpeg`（既存 `isAllowedImageFileName` と同じ制約）
- 上書き: `asset.copy(videoId, token, true)` を使用してダイアログなしで上書きする。
- 未割り当て: `assetPublicPath: null` のシーンは U12-E で visual なし（または省略）として扱う。

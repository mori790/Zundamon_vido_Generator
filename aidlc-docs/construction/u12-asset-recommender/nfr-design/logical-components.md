# Logical Components: U12-D 素材割り当て

## `SceneWithAsset` 型追加（共有型層）

- **場所**: `src/studio/shared/scene-segmentation.ts` への追加
- **定義**:
  ```typescript
  export type SceneWithAsset = Scene & {
    assetPublicPath: string | null;
    assetFileName: string | null;
  };
  ```
- **NFR 役割**: U12-D（割り当て）・U12-E（JSON生成）で共有される型。

## `AssetAssignTab`（Renderer 層）

- **場所**: `src/studio/renderer/AssetAssignTab.tsx`
- **目的**: シーン一覧に素材を割り当てる。ローディングインデックスパターン・エラー自動クリアパターン・Overwrite-Always パターンを担う。
- **Props**:
  ```typescript
  type Props = {
    initialScenes: Scene[];
    videoId: string | null;
    onConfirm(scenes: SceneWithAsset[]): void;
  };
  ```
- **状態**:
  - `scenes: SceneWithAsset[]` — 割り当て中のシーン配列（lazy init で `assetPublicPath: null`）
  - `errors: Record<number, string>` — シーンインデックスをキーとするエラーメッセージ
  - `loadingIndex: number | null` — ローディングインデックスパターン
- **ハンドラ**:
  - `handleAssign(index: number)` (async): エラークリア → `setLoadingIndex(index)` → `asset.select()` → `asset.copy()` → `setScenes` / `setErrors` → `finally: setLoadingIndex(null)`
  - `handleClear(index: number)`: `assetPublicPath/assetFileName` を null に + `errors[index]` をクリア
- **グローバル参照**: `declare global { var localFileApi: LocalFileApi | undefined; }`
- **NFR 役割**: ローディングインデックスパターン / エラー自動クリアパターン / Overwrite-Always パターンの全実装を担う。

## `SceneAssetCard`（Renderer 層）

- **場所**: `src/studio/renderer/SceneAssetCard.tsx`
- **目的**: 1シーン分の素材割り当てカード。割り当て状況の表示と操作ボタンを提供する。
- **Props**:
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
- 「素材を選択」ボタン: `disabled={disabled || !videoId}` — `videoId` は Props で渡さず、`disabled` 経由で親が制御する。
- **NFR 役割**: ローディングインデックスパターンの表示部分（`isLoading` → ボタンラベル変更 / `disabled` → 他シーン選択不可）。

## `JsonGeneratePlaceholder`（StudioApp 内インライン）

- **場所**: `src/studio/renderer/StudioApp.tsx` 内のインライン関数コンポーネント
- **目的**: U12-E 実装前の placeholder。`count` prop でシーン件数を表示する。
- **NFR 役割**: なし（表示のみ）。

## StudioApp への変更点

- `AssetAssignTab` を import する（既存 `AssetAssignPlaceholder` を置き換え）。
- `MainTab` 型に `'json-generate'` を追加する。
- `StudioContent` に `scenesWithAssets: SceneWithAsset[] | null` 状態を追加する。
- `activeTab === 'asset-assign'` のとき: `AssetAssignTab` をレンダリングする。
- `activeTab === 'json-generate'` のとき: `JsonGeneratePlaceholder` をレンダリングする。
- タブバーに「JSON生成」タブを追加する（`disabled={!scenesWithAssets}`）。
- `AssetAssignTab.onConfirm` で `setScenesWithAssets(result)` + `setActiveTab('json-generate')`。
- 既存 `AssetAssignPlaceholder` 関数コンポーネントを削除する。

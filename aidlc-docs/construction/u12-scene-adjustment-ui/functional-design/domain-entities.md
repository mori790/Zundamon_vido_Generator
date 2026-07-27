# Domain Entities: U12-C シーン調整UI

## 既存型（U12-B 定義済み）

```typescript
// src/studio/shared/scene-segmentation.ts
type Scene = {
  id: string;       // 'scene-001' 形式（保存時に確定）
  title: string;
  narration: string;
  tags: string[];
};

type SceneDraft = TextInputDraft & {
  scenes: Scene[] | null;
  segmentedAt: string | null;
};
```

## U12-C ローカル型（コンポーネント内限定・エクスポートしない）

```typescript
// src/studio/renderer/SceneListTab.tsx 内
type EditableScene = Scene & {
  _key: string;  // React key 用のランタイム識別子。保存時に除去する。
};
```

`_key` は `Scene` 型に含めない。保存時に `finalScenes: Scene[]` へ変換し、`_key` を除去する。

## シーン状態遷移

```
[segmented by U12-B]
  SceneDraft { scenes: Scene[] }
       ↓ SceneListTab mount
  EditableScene[]（_key 付きコピー）
       ↓ ユーザー編集（add / remove / move / edit）
  EditableScene[]（変更済み）
       ↓ 完了ボタン
  Scene[]（ID 再割り当て）+ SceneDraft 保存
       ↓
  U12-D タブ（asset-assign placeholder）
```

## 編集操作の種類

| 操作 | トリガー | データ変化 |
|---|---|---|
| title 編集 | title input の onChange | `editableScenes[i].title` 更新 |
| narration 編集 | textarea の onChange | `editableScenes[i].narration` 更新 |
| tags 編集 | tags input の onChange | カンマで split → `string[]` に変換して更新 |
| 上へ移動 | 「▲ 上へ」ボタン | index i と i-1 を swap |
| 下へ移動 | 「▼ 下へ」ボタン | index i と i+1 を swap |
| シーン追加 | 「+ シーンを追加」ボタン | 末尾に空 EditableScene を追加 |
| シーン削除 | 「削除」ボタン | index i を除去 |

## 保存データ構造

完了時に保存する SceneDraft:

```typescript
{
  draftText: string;       // 変更なし（U12-B から継承）
  savedAt: string;         // 保存時刻（ISO 8601）
  scenes: Scene[];         // 調整済みシーン配列（ID 再割り当て済み）
  segmentedAt: string;     // 変更なし（U12-B から継承）
}
```

scenes の ID は `scene-001`, `scene-002`, ... の順で保存時に確定する（編集中の _key とは独立）。

# Code Summary: U12-C シーン調整UI

## 生成・変更ファイル一覧

### 新規作成

| ファイル | 役割 |
|---|---|
| `src/studio/renderer/scene-editing.ts` | EditableScene 型 + 純粋関数 6種（moveScene, addScene, removeScene, updateSceneField, finalizeScenes, parseTags）。React 不使用。 |
| `src/studio/renderer/SceneCard.tsx` | 1シーン分の編集フォーム。title / narration / tags 入力 + ▲▼ 削除ボタン（aria-label / disabled / type="button"）。 |
| `src/studio/renderer/SceneListTab.tsx` | シーン一覧編集タブ。EditableScene[] 状態管理、saving フラグ、Fail-Open SceneDraft 保存、onConfirm 呼び出し。 |
| `tests/studio/scene-editing.test.ts` | 純粋関数単体テスト 17件。moveScene 4 / addScene 2 / removeScene 2 / updateSceneField 3 / finalizeScenes 3 / parseTags 3。 |

### 変更

| ファイル | 変更内容 |
|---|---|
| `src/studio/renderer/TextInputTab.tsx` | `onSegmentationComplete` シグネチャに `meta: {draftText, segmentedAt}` を追加。呼び出し時に meta を渡す。 |
| `src/studio/renderer/StudioApp.tsx` | `SceneListTab` import 追加。`MainTab` に `'asset-assign'` 追加。`sceneDraftMeta` 状態追加。タブバーに「素材割り当て」追加。`ScenePlaceholder` を `SceneListTab` に置き換え。`AssetAssignPlaceholder` 追加。`onSegmentationComplete` に meta 受け取り追加。 |

## US-3 対応マッピング

| ストーリー | ファイル | 実装内容 |
|---|---|---|
| US-3 シーン調整 | SceneListTab.tsx | Scene[] 表示 → 編集 → 完了 → SceneDraft 保存 → asset-assign タブへ遷移 |
| US-3 シーン追加 | scene-editing.ts / SceneListTab.tsx | addScene → 末尾に空カード挿入 |
| US-3 シーン削除 | scene-editing.ts / SceneListTab.tsx | removeScene → filter 除去 |
| US-3 並び替え | scene-editing.ts / SceneCard.tsx | moveScene → ▲▼ swap |
| US-3 Fail-Open | SceneListTab.tsx | draft.write().catch(console.error) → onConfirm はブロックしない |

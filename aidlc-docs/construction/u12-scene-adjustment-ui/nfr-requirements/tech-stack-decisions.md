# Tech Stack Decisions: U12-C シーン調整UI

## 新規 npm 依存

**なし。** ドラッグ&ドロップライブラリ（@dnd-kit 等）は導入しない（Q1 で上下ボタン方式を選択）。

## ロジック分離ファイル

| ファイル | 役割 |
|---|---|
| `src/studio/renderer/scene-editing.ts` | `EditableScene` 型定義 + 純粋関数群（moveScene, addScene, removeScene, updateSceneField, finalizeScenes, parseTags） |

`scene-editing.ts` は React を import しない純粋 TypeScript ファイルとする。これにより Vitest で DOM なしに単体テストが実行できる。

## テストフレームワーク

**Vitest**（既存、変更なし）。`tests/studio/scene-editing.test.ts` を新規作成する。

## IPC

**新規チャンネルなし。** SceneDraft 保存は既存の `local-file:write-draft` を使用する。

## 型依存

```
scene-editing.ts
  → imports Scene from ../shared/scene-segmentation
  → exports EditableScene, moveScene, addScene, ...

SceneListTab.tsx
  → imports EditableScene, moveScene, addScene, ... from ./scene-editing
  → imports Scene, SceneDraft from ../shared/scene-segmentation
  → imports LocalFileApi from ../shared/local-file

SceneCard.tsx
  → imports EditableScene from ./scene-editing
```

## 決定根拠

| 判断 | 根拠 |
|---|---|
| `scene-editing.ts` を renderer/ に置く | `EditableScene._key` は UI 固有の概念で `shared/` には属さない |
| 純粋関数テストのみ | U12-C の複雑性はロジックにあり、UI レンダリングのリグレッションリスクは低い |
| 自動保存なし | 編集中の SceneDraft 上書きを防ぐ。完了確定後にのみ書き込む |

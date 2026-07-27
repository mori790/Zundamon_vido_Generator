# Code Generation Plan: U12-C シーン調整UI

## ユニットコンテキスト

- **ユニット**: U12-C シーン調整UI
- **目標**: AI 分割で生成された Scene[] をユーザーが編集（並び替え・追加・削除・フィールド編集）し、確定後に SceneDraft を保存して U12-D placeholder へ遷移する。
- **対象ストーリー**: US-3 後半（ユーザーによるシーン調整・確定）
- **依存**: U12-B 完了済み（Scene[] / SceneDraft / sceneSegmentationApi / ScenePlaceholder）

## ターゲットコードロケーション

### 新規作成ファイル

| ファイル | 役割 |
|---|---|
| `src/studio/renderer/scene-editing.ts` | `EditableScene` 型定義 + 6純粋関数（moveScene, addScene, removeScene, updateSceneField, finalizeScenes, parseTags）。React 不使用。 |
| `src/studio/renderer/SceneListTab.tsx` | シーン一覧編集タブ。EditableScene[] 状態管理、saving フラグ、Fail-Open 保存、onConfirm 呼び出し。 |
| `src/studio/renderer/SceneCard.tsx` | 1シーン分編集カード。title/narration/tags input、▲▼ 削除ボタン（aria-label / disabled）。 |
| `tests/studio/scene-editing.test.ts` | scene-editing.ts の純粋関数単体テスト（moveScene 4件、addScene 2件、removeScene 2件、updateSceneField 3件、finalizeScenes 3件、parseTags 3件 = 計17件）。 |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/studio/renderer/TextInputTab.tsx` | `onSegmentationComplete` シグネチャを `(scenes: Scene[], meta: {draftText: string; segmentedAt: string}) => void` に変更。handleSegmentationStart 末尾で meta を渡す。 |
| `src/studio/renderer/StudioApp.tsx` | `MainTab` に `'asset-assign'` 追加。`sceneDraftMeta` 状態追加。`ScenePlaceholder` を `SceneListTab` に置き換え。`AssetAssignPlaceholder` 追加。`onSegmentationComplete` ハンドラに meta 受け取りを追加。シーン調整タブに `SceneListTab` を渡す。 |

### ドキュメント成果物

| ファイル | 内容 |
|---|---|
| `aidlc-docs/construction/u12-scene-adjustment-ui/code/summary.md` | 生成・変更ファイル一覧 |

## ステップ別生成計画

### Step 1: scene-editing.ts（純粋関数層）

- [ ] `src/studio/renderer/scene-editing.ts` を作成する。
  - `import type {Scene} from '../shared/scene-segmentation'`
  - `export type EditableScene = Scene & {_key: string}`
  - `moveScene(scenes, index, direction: 'up' | 'down')`: 境界外なら同じ配列を返す。境界内なら spread で swap。
  - `addScene(scenes)`: `{_key: \`new-\${scenes.length}-\${Math.random().toString(36).slice(2)}\`, id: '', title: '', narration: '', tags: []}` を末尾に追加。
  - `removeScene(scenes, index)`: `filter((_, i) => i !== index)`。
  - `updateSceneField(scenes, index, field, value)`: `map` で対象のみ更新。`value` は `string | string[]`（tags は `string[]`）。
  - `finalizeScenes(scenes)`: `map((s, i) => ({id: \`scene-\${String(i+1).padStart(3,'0')}\`, title: s.title.trim(), narration: s.narration.trim(), tags: s.tags.map(t => t.trim()).filter(Boolean)}))`。`_key` は含めない。
  - `parseTags(input: string)`: `input.split(',').map(t => t.trim()).filter(Boolean)`。

### Step 2: SceneCard.tsx

- [ ] `src/studio/renderer/SceneCard.tsx` を作成する。
  - Props: `scene: EditableScene, index: number, total: number, onChange(field, value: string): void, onMoveUp(): void, onMoveDown(): void, onRemove(): void`
  - scene.id が空の場合は `#${index + 1}` を仮表示する。
  - tags の value は `scene.tags.join(', ')`。
  - すべてのボタンに `type="button"` と `aria-label` を付与する。
  - ▲ ボタン: `disabled={index === 0}`
  - ▼ ボタン: `disabled={index === total - 1}`

### Step 3: SceneListTab.tsx

- [ ] `src/studio/renderer/SceneListTab.tsx` を作成する。
  - Props: `scenes: Scene[], videoId: string | null, initialDraftText: string, initialSegmentedAt: string | null, onConfirm(scenes: Scene[]): void`
  - `editableScenes` を `useState(() => scenes.map((s, i) => ({...s, _key: \`init-\${i}\`})))` で初期化。
  - `saving: boolean` 状態。
  - `declare global { var localFileApi: LocalFileApi | undefined; }`
  - `handleSceneChange(index, field, value: string)`: field === 'tags' のとき `parseTags(value)` を呼び出して `string[]` に変換して `updateSceneField` に渡す。
  - `handleConfirm()` (async): `setSaving(true)` → `finalizeScenes` → Fail-Open `draft.write` → `setSaving(false)` → `onConfirm(finalScenes)`。

### Step 4: TextInputTab.tsx の変更

- [ ] `src/studio/renderer/TextInputTab.tsx` を変更する。
  - Props の `onSegmentationComplete` を `(scenes: Scene[], meta: {draftText: string; segmentedAt: string}) => void` に変更する。
  - `handleSegmentationStart` の末尾: `onSegmentationComplete(segResult.scenes, {draftText: currentText, segmentedAt: new Date().toISOString()})` を呼び出す。

### Step 5: StudioApp.tsx の変更

- [ ] `src/studio/renderer/StudioApp.tsx` を変更する。
  - `SceneListTab` を import する。
  - `MainTab` 型に `'asset-assign'` を追加する: `'workspace' | 'text-input' | 'scenes' | 'asset-assign'`
  - `StudioContent` に `sceneDraftMeta: {draftText: string; segmentedAt: string} | null` 状態を追加する。
  - `onSegmentationComplete` ハンドラを `(newScenes, meta) => { setScenes(newScenes); setSceneDraftMeta(meta); setActiveTab('scenes'); }` に更新する。
  - `activeTab === 'scenes' && scenes` のブロックで `ScenePlaceholder` を `SceneListTab` に置き換える。
  - `activeTab === 'asset-assign'` のブロックで `AssetAssignPlaceholder` をレンダリングする。
  - シーン調整タブの disabled 条件を `!scenes` のままにする。
  - タブバーに「素材割り当て」タブ（`data-testid="tab-asset-assign"`）を追加する（`disabled={!scenes}`）。
  - `ScenePlaceholder` 関数コンポーネントを削除する。
  - `AssetAssignPlaceholder` 関数コンポーネントを追加する。

### Step 6: 単体テスト

- [ ] `tests/studio/scene-editing.test.ts` を作成する。
  - `moveScene`: 上移動、下移動、先頭で上（ノーオプ）、末尾で下（ノーオプ）
  - `addScene`: 件数が増える、追加シーンのフィールドが空
  - `removeScene`: 件数が減る、正しいインデックスが除去される
  - `updateSceneField`: title 更新、narration 更新、tags 更新（string[]）
  - `finalizeScenes`: ID が scene-001 から振り直される、_key が含まれない、trim が適用される
  - `parseTags`: 正常系（カンマ区切り）、空文字（空配列）、余分なスペース（trim）

### Step 7: ドキュメント

- [ ] `aidlc-docs/construction/u12-scene-adjustment-ui/code/summary.md` を作成する。

### Step 8: 検証

- [ ] `npx tsc --noEmit` を実行する。
- [ ] `npm test` を実行する。
- [ ] `npm run studio:build` を実行する。

## ストーリートレーサビリティ

| ストーリー | カバー内容 |
|---|---|
| US-3 シーン調整 正常系 | Scene[] 表示 → 編集 → 完了 → SceneDraft 保存 → U12-D placeholder へ |
| US-3 シーン追加 | + シーンを追加 → 空カード末尾挿入 → 完了で ID 割り当て |
| US-3 シーン削除 | 削除ボタン → filter → 完了で ID 再割り当て |
| US-3 並び替え | ▲/▼ ボタン → swap → 完了で ID 再割り当て |
| US-3 Fail-Open | SceneDraft 保存失敗 → console.error のみ → タブ切り替えは継続 |

## 承認ゲート

このプランは U12-C Code Generation の実装根拠となる。コード変更はこのプランの承認後に開始する。

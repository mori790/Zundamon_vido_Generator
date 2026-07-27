# Business Logic Model: U12-E VideoScript JSON 生成

## 純粋関数層（`src/studio/shared/script-builder.ts`）

### `resolveSceneType(index: number, total: number): SceneType`

```
index === 0                → 'title'
index === total - 1        → 'ending'
それ以外                   → 'explanation'
```

エッジケース: `total === 1` の場合、`index === 0` かつ `index === total - 1` は両方成立するが、
`index === 0` を優先して `'title'` を返す。

### `buildVideoScript(scenes: SceneWithAsset[], videoId: string, title: string): VideoScript`

1. `total = scenes.length`
2. 各 scene を `types/video.Scene` にマッピングする（マッピング規則は domain-entities.md 参照）
3. デフォルト speaker / video / subtitle を付加する
4. `{ id: videoId, title, speaker, video, subtitle, scenes: mappedScenes }` を返す

**副作用なし**: ファイル書き込みはコンポーネント層が担う。

## UIハンドラ層（`src/studio/renderer/JsonGenerateTab.tsx`）

### `handleGenerate()` フロー

```
setState: generating=true, error=null, saved=false
↓
buildVideoScript(scenes, videoId, title)
↓
JSON.stringify(script, null, 2)
↓
globalThis.localFileApi?.workspace.writeScript(`${videoId}.json`, json)
↓
成功: setSaved(true)
失敗: setError(message)
↓
finally: setGenerating(false)
```

### 生成後 UI 状態

- `saved === true`: 成功メッセージ + 「ワークスペースを開く」ボタン
- ボタン押下: `onSuccess(videoId)` を呼ぶ（StudioApp が `openWorkspace(videoId)` + タブ切り替えを実行）
- `error !== null`: エラーメッセージを表示（再試行可能）

## StudioApp 連携

`JsonGenerateTab.onSuccess(videoId)` を受け取る `StudioContent` 側の処理:

```typescript
onSuccess={(vid) => {
  void openWorkspace(vid);
  setActiveTab('workspace');
}}
```

`openWorkspace` は既存の実装を再利用する。`setActiveTab('workspace')` で遷移する。

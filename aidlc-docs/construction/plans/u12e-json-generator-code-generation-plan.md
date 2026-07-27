# Code Generation Plan: U12-E VideoScript JSON 生成

## 変更ファイル一覧

| # | ファイル | 操作 |
|---|---|---|
| 1 | `src/studio/shared/script-builder.ts` | 新規作成 |
| 2 | `src/studio/renderer/JsonGenerateTab.tsx` | 新規作成 |
| 3 | `src/studio/renderer/StudioApp.tsx` | 編集（2箇所） |
| 4 | `tests/studio/script-builder.test.ts` | 新規作成 |

## 実装手順

### ステップ 1: `script-builder.ts` 新規作成

imports:
```typescript
import type {Scene as VideoScene, SceneType, SpeakerConfig, SubtitleConfig, VideoConfig, VideoScript} from '../../types/video';
import type {SceneWithAsset} from './scene-segmentation';
```

注意: `types/video.ts` の `Scene` は `Scene as VideoScene` でエイリアスする（`scene-segmentation.ts` の `Scene` と名前衝突を回避）。

内部定数（エクスポートしない）:
- `DEFAULT_SPEAKER`: `{engine:'voicevox', speakerId:3, speedScale:1.05, pitchScale:0, intonationScale:1, volumeScale:1}`
- `DEFAULT_VIDEO`: `{width:1920, height:1080, fps:30, background:'/backgrounds/default.svg', bgmVolume:0.1}`
- `DEFAULT_SUBTITLE`: `{enabled:true, maxCharactersPerLine:24, maxLines:2, fontSize:56, bottom:50, highlightKeywords:[]}`

エクスポート関数:
```typescript
export function resolveSceneType(index: number, total: number): SceneType
  // index === 0 → 'title'
  // index === total - 1 → 'ending'
  // その他 → 'explanation'

export function buildVideoScript(scenes: SceneWithAsset[], videoId: string, title: string): VideoScript
  // total = scenes.length
  // scenes.map → VideoScene（id, type, text=narration, emotion='normal', visual, durationBefore=0.2, durationAfter=0.3, characterVisible=true）
  // visual: assetPublicPath あり → {type:'image', src, position:'center', fit:'contain'} / なし → {type:'none'}
  // {id:videoId, title, speaker:DEFAULT_SPEAKER, video:DEFAULT_VIDEO, subtitle:DEFAULT_SUBTITLE, scenes}
```

### ステップ 2: `JsonGenerateTab.tsx` 新規作成

Props: `{scenes: SceneWithAsset[], videoId: string, onSuccess(videoId: string): void}`

状態: `title=useState(videoId)`, `generating`, `saved`, `error`

`declare global { var localFileApi: LocalFileApi | undefined; }` を配置。

`handleGenerate()` (async, Fail-Visible + Saving Flag パターン):
1. `setGenerating(true); setError(null); setSaved(false)`
2. `buildVideoScript(scenes, videoId, title)`
3. `JSON.stringify(script, null, 2)`
4. `await globalThis.localFileApi?.workspace.writeScript(`${videoId}.json`, json)`
5. `setSaved(true)`（成功）/ `setError(message)`（失敗）
6. `finally: setGenerating(false)`

render:
- 動画タイトル: `<label htmlFor="video-title">` + `<input id="video-title" value={title} />`
- エラー: `{error ? <p className="error-banner">{error}</p> : null}`
- 成功 (`saved===true`): `data-testid="json-generate-success"` + 「ワークスペースを開く」ボタン → `onSuccess(videoId)`
- 通常: `<button disabled={generating}>` → `{generating ? '生成中...' : 'JSONを生成して保存'}`
- `data-testid="json-generate-tab"`

### ステップ 3: `StudioApp.tsx` 編集（2箇所）

**3-A: import 追加**（既存 import 群の末尾）
```typescript
import {JsonGenerateTab} from './JsonGenerateTab';
```

**3-B: `json-generate` render 置き換え + `JsonGeneratePlaceholder` 削除**

`activeTab === 'json-generate'` ブロックを変更:
```tsx
if (activeTab === 'json-generate' && scenesWithAssets) {
  return (
    <>
      {tabBar}
      <JsonGenerateTab
        scenes={scenesWithAssets}
        videoId={workspace?.videoId ?? ''}
        onSuccess={(vid) => {
          void openWorkspace(vid);
          setActiveTab('workspace');
        }}
      />
    </>
  );
}
```

`JsonGeneratePlaceholder` 関数コンポーネントを削除する。

### ステップ 4: `tests/studio/script-builder.test.ts` 新規作成

テストケース（9件以上）:
- `resolveSceneType`: index=0/last/middle, total=1（first = last 優先確認）
- `buildVideoScript`: id/title, narration→text, assetPublicPath→image visual, null→none visual, 複数シーンの type マッピング（title/explanation/ending）, emotion='normal', durationBeforeSpeech/durationAfterSpeech 値

## ビルド・テスト

```bash
npx tsc --noEmit && npm test && npm run studio:build
```

期待結果:
- 型エラーなし
- 既存193件 + script-builder 新規テスト全通過
- Electron ビルド成功

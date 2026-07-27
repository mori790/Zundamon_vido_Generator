# Domain Entities: U12-E VideoScript JSON 生成

## 入力エンティティ

### `SceneWithAsset`（`src/studio/shared/scene-segmentation.ts` より）

```typescript
type SceneWithAsset = Scene & {
  assetPublicPath: string | null;
  assetFileName: string | null;
};
```

U12-D からパイプラインで渡される。`assetPublicPath` が `null` のシーンも許容する。

## 出力エンティティ

### `VideoScript`（`src/types/video.ts` より）

```typescript
type VideoScript = {
  id: string;
  title: string;
  speaker: SpeakerConfig;
  video: VideoConfig;
  subtitle: SubtitleConfig;
  scenes: Scene[];   // src/types/video.ts の Scene 型（shared/scene-segmentation の Scene とは別）
};
```

生成後は `input/{videoId}.json` として保存される。

## マッピング規則

### SceneWithAsset → types/video.Scene

| 入力フィールド | 出力フィールド | 変換規則 |
|---|---|---|
| `scene.id` | `Scene.id` | そのまま |
| `scene.narration` | `Scene.text` | そのまま（VOICEVOX 読み上げテキスト） |
| `index, total` | `Scene.type` | `resolveSceneType(index, total)` |
| —（固定） | `Scene.emotion` | `'normal'` |
| `scene.assetPublicPath` | `Scene.visual` | null → `{type:'none'}`、値あり → `{type:'image', src, position:'center', fit:'contain'}` |
| —（固定） | `Scene.durationBeforeSpeech` | `0.2` |
| —（固定） | `Scene.durationAfterSpeech` | `0.3` |
| —（固定） | `Scene.characterVisible` | `true` |

### `resolveSceneType(index, total)` 規則

| 条件 | SceneType |
|---|---|
| `index === 0` | `'title'` |
| `index === total - 1` | `'ending'` |
| その他 | `'explanation'` |

### VideoScript トップレベル デフォルト値

```typescript
speaker: { engine: 'voicevox', speakerId: 3, speedScale: 1.05, pitchScale: 0, intonationScale: 1, volumeScale: 1 }
video:   { width: 1920, height: 1080, fps: 30, background: '/backgrounds/default.svg', bgmVolume: 0.1 }
subtitle:{ enabled: true, maxCharactersPerLine: 24, maxLines: 2, fontSize: 56, bottom: 50, highlightKeywords: [] }
```

# Component Design: U12-E VideoScript JSON 生成

## コンポーネント階層

```
StudioApp
└── StudioContent
    ├── tabBar（JSON生成タブは既存）
    └── [activeTab === 'json-generate'] JsonGenerateTab   ← JsonGeneratePlaceholder を置き換え
```

## 新規ファイル

### `src/studio/shared/script-builder.ts`

```typescript
export function resolveSceneType(index: number, total: number): SceneType
export function buildVideoScript(scenes: SceneWithAsset[], videoId: string, title: string): VideoScript
```

- `SceneWithAsset` を import: `import type {SceneWithAsset} from './scene-segmentation'`
- `VideoScript`, `SceneType` 等を import: `import type {...} from '../../types/video'`
- ファイル内に DEFAULT_SPEAKER / DEFAULT_VIDEO / DEFAULT_SUBTITLE 定数を定義する（エクスポートしない）

### `src/studio/renderer/JsonGenerateTab.tsx`

**Props**:
```typescript
type Props = {
  scenes: SceneWithAsset[];
  videoId: string;
  onSuccess(videoId: string): void;
};
```

**状態**:
```typescript
const [title, setTitle] = useState(videoId);
const [generating, setGenerating] = useState(false);
const [saved, setSaved] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**レンダリング構造**:
```
<section className="json-generate-tab" data-testid="json-generate-tab">
  <h2>JSON生成</h2>
  <p className="muted">{scenes.length}件のシーン</p>

  <div className="field-group">
    <label htmlFor="video-title">動画タイトル</label>
    <input id="video-title" value={title} onChange={...} />
  </div>

  {error ? <p className="error-banner">{error}</p> : null}

  {saved ? (
    <div data-testid="json-generate-success">
      <p>input/{videoId}.json を保存しました。</p>
      <button onClick={() => onSuccess(videoId)} type="button">
        ワークスペースを開く
      </button>
    </div>
  ) : (
    <button disabled={generating} onClick={() => void handleGenerate()} type="button">
      {generating ? '生成中...' : 'JSONを生成して保存'}
    </button>
  )}
</section>
```

**`declare global { var localFileApi: LocalFileApi | undefined; }`** を配置する。

## 既存ファイル変更

### `src/studio/renderer/StudioApp.tsx`

1. `import {JsonGenerateTab} from './JsonGenerateTab'` を追加する。
2. `activeTab === 'json-generate'` の render を `JsonGeneratePlaceholder` から `JsonGenerateTab` に置き換える:
   ```tsx
   <JsonGenerateTab
     scenes={scenesWithAssets}
     videoId={workspace?.videoId ?? ''}
     onSuccess={(vid) => {
       void openWorkspace(vid);
       setActiveTab('workspace');
     }}
   />
   ```
3. `JsonGeneratePlaceholder` 関数を削除する。

## 新規テスト

### `tests/studio/script-builder.test.ts`

- `resolveSceneType`: index=0, last, middle, total=1 のケース
- `buildVideoScript`: scenes → VideoScript の各フィールドマッピング（id, title, type, text, visual）

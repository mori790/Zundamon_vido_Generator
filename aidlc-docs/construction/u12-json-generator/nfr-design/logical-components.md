# Logical Components: U12-E VideoScript JSON 生成

## `script-builder.ts`（共有ロジック層）

- **場所**: `src/studio/shared/script-builder.ts`
- **エクスポート**:
  - `resolveSceneType(index: number, total: number): SceneType`
  - `buildVideoScript(scenes: SceneWithAsset[], videoId: string, title: string): VideoScript`
- **内部定数**（エクスポートしない）:
  - `DEFAULT_SPEAKER: SpeakerConfig`
  - `DEFAULT_VIDEO: VideoConfig`
  - `DEFAULT_SUBTITLE: SubtitleConfig`
- **NFR 役割**: 副作用なしの純粋関数。Vitest でテスト可能。

## `JsonGenerateTab`（Renderer 層）

- **場所**: `src/studio/renderer/JsonGenerateTab.tsx`
- **Props**:
  ```typescript
  type Props = {
    scenes: SceneWithAsset[];
    videoId: string;
    onSuccess(videoId: string): void;
  };
  ```
- **状態**:
  - `title: string` — 初期値 `videoId`（`useState(videoId)` で lazy init）
  - `generating: boolean` — Saving Flag パターン
  - `saved: boolean` — 成功後 UI 切り替えフラグ
  - `error: string | null` — Fail-Visible パターン
- **ハンドラ**: `handleGenerate()` async — Fail-Visible + Saving Flag パターンを実装
- **グローバル参照**: `declare global { var localFileApi: LocalFileApi | undefined; }`
- **NFR 役割**: Fail-Visible パターン / Saving Flag パターンの全実装を担う。

## StudioApp への変更点

- `import {JsonGenerateTab} from './JsonGenerateTab'` を追加する。
- `activeTab === 'json-generate'` の render を更新する:
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
- `JsonGeneratePlaceholder` 関数コンポーネントを削除する。

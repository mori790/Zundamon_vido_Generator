# Code Summary: U12-B AIシーン分割エンジン

## 生成・変更ファイル一覧

### 新規作成

| ファイル | 役割 |
|---|---|
| `src/studio/shared/scene-segmentation.ts` | Scene / SceneDraft / SegmentationResult / SceneSegmentationApi 型定義。buildSegmentationPrompt / parseSegmentationResponse 純粋関数。 |
| `tests/studio/scene-segmentation.test.ts` | 純粋関数単体テスト（9ケース）。buildSegmentationPrompt / parseSegmentationResponse の正常系・エラー系・フォールバック。 |

### 変更

| ファイル | 変更内容 |
|---|---|
| `src/studio/main/main.ts` | `scene-segmentation:segment` IPC ハンドラ追加。Listener-Before-Send / Promise+120秒タイムアウト / Fail-Fast 実装。 |
| `src/studio/main/preload.ts` | `SceneSegmentationApi` import 追加。`sceneSegmentationApi` を contextBridge で公開。 |
| `src/studio/renderer/TextInputTab.tsx` | Props を `onSegmentationComplete(scenes: Scene[])` に変更。handleSegmentationStart を async 化。64KB チェック / IPC 呼び出し / SceneDraft 保存（Fail-Open）を実装。 |
| `src/studio/renderer/StudioApp.tsx` | `Scene` import 追加。`MainTab` 型に `'scenes'` 追加。`scenes` 状態を追加。シーン調整タブ追加。`ScenePlaceholder` コンポーネント追加。`onSegmentationComplete` で scenes 更新 + タブ切り替え。 |

## US-3 対応マッピング

| ストーリー | ファイル | 実装内容 |
|---|---|---|
| US-3 正常系 | TextInputTab.tsx | Codex IPC 呼び出し → Scene[] → SceneDraft 保存 → シーン調整タブへ遷移 |
| US-3 エラー（未接続） | main.ts | `codex.send()` catch → `codex-not-connected` → TextInputStatusMessage 表示 |
| US-3 エラー（アクティブ） | main.ts | `codex.send()` catch → `codex-turn-active` → TextInputStatusMessage 表示 |
| US-3 エラー（パース失敗） | scene-segmentation.ts | `parseSegmentationResponse` → `parse-error` → TextInputStatusMessage 表示 |
| US-3 エラー（タイムアウト） | main.ts | 120秒 setTimeout → `timeout` → TextInputStatusMessage 表示 |
| US-3 エラー（64KB超過） | TextInputTab.tsx | `TextEncoder().encode().byteLength` チェック → `segmentation-error` |

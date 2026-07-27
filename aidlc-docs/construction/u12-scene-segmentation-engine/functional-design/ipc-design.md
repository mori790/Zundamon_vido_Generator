# IPC Design: U12-B AIシーン分割エンジン

## scene-segmentation:segment

### 概要

草案テキストをCodexへ送信し、シーン配列を返す。既存の `CodexAppServerService` インスタンスを共有する。

### チャンネル定義

| 項目 | 内容 |
|---|---|
| チャンネル名 | `scene-segmentation:segment` |
| 方向 | Renderer → Main（invoke/handle） |
| Main process ハンドラ | `ipcMain.handle('scene-segmentation:segment', ...)` |
| Renderer 呼び出し | `ipcRenderer.invoke('scene-segmentation:segment', draftText, videoId)` |

### 入力

| 引数 | 型 | 説明 |
|---|---|---|
| `draftText` | `string` | テキストエリアの草案テキスト（1MB以下、空文字列不可） |
| `videoId` | `string` | Codex セッションの videoId（既存の `codex:connect` と同じ） |

### 出力

`SegmentationResult`（`src/studio/shared/scene-segmentation.ts` で定義）

```typescript
type SegmentationResult =
  | { ok: true; scenes: Scene[] }
  | { ok: false; reason: SegmentationErrorReason; message: string };
```

### Main Process 実装概要

```typescript
ipcMain.handle('scene-segmentation:segment', async (_event, draftText: string, videoId: string) => {
  const prompt = buildSegmentationPrompt(draftText);

  return new Promise<SegmentationResult>((resolve) => {
    const timeout = setTimeout(() => {
      unsub();
      resolve({ ok: false, reason: 'timeout', message: '...' });
    }, 120_000);

    const unsub = codex.onEvent((event) => {
      if (event.type === 'turn-completed') {
        clearTimeout(timeout);
        unsub();
        resolve(parseSegmentationResponse(event.message.content));
      } else if (event.type === 'turn-failed') {
        clearTimeout(timeout);
        unsub();
        resolve({ ok: false, reason: 'turn-failed', message: event.message });
      }
    });

    codex.send({ videoId, message: prompt, context: { workspaceMode: 'empty-draft' } })
      .catch((err: Error) => {
        clearTimeout(timeout);
        unsub();
        const reason = err.message.includes('not connected') ? 'codex-not-connected'
          : err.message.includes('already active') ? 'codex-turn-active'
          : 'turn-failed';
        resolve({ ok: false, reason, message: err.message });
      });
  });
});
```

### Preload 公開

```typescript
contextBridge.exposeInMainWorld('sceneSegmentationApi', {
  segment: (draftText: string, videoId: string) =>
    ipcRenderer.invoke('scene-segmentation:segment', draftText, videoId),
} satisfies SceneSegmentationApi);
```

### Renderer 利用

```typescript
// src/studio/renderer/StudioApp.tsx
async function segmentScenes(draftText: string, videoId: string): Promise<SegmentationResult> {
  const api = globalThis.sceneSegmentationApi;
  if (!api) {
    return { ok: false, reason: 'codex-not-connected', message: 'Electron環境が必要です。' };
  }
  return api.segment(draftText, videoId);
}
```

## 既存 codex:event との共存

シーン分割リクエスト中は、既存の `codex:event` IPC が引き続き CodexPanel へもブロードキャストされる。結果として:
- 分割プロンプトと応答がCodexパネルのチャット履歴に表示される（Q3: A = 透明性のため意図的）
- CodexPanel の delta 表示でストリーミングが見える
- 分割完了後は `turn-completed` イベントが CodexPanel にも届き、チャット履歴が更新される

## 新規共有型ファイル

| ファイル | 内容 |
|---|---|
| `src/studio/shared/scene-segmentation.ts` | `Scene`, `SceneDraft`, `SegmentationResult`, `SegmentationErrorReason`, `SceneSegmentationApi` 型定義。`buildSegmentationPrompt`, `parseSegmentationResponse` 純粋関数。 |

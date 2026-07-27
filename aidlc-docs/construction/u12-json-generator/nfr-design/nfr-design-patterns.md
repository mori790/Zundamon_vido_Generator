# NFR Design Patterns: U12-E VideoScript JSON 生成

## Fail-Visible パターン（Fail-Visible Pattern）

書き込み失敗時にエラーメッセージを UI に表示し、再試行を可能にする。

```typescript
async function handleGenerate() {
  setGenerating(true);
  setError(null);   // 再試行時に前のエラーをクリア
  setSaved(false);
  try {
    const script = buildVideoScript(scenes, videoId, title);
    const json = JSON.stringify(script, null, 2);
    await globalThis.localFileApi?.workspace.writeScript(`${videoId}.json`, json);
    setSaved(true);
  } catch (caught) {
    setError(caught instanceof Error ? caught.message : 'JSONの保存に失敗しました。再試行してください。');
  } finally {
    setGenerating(false);
  }
}
```

- `setSaved(true)` は try 内の成功パスのみ。失敗時は `saved === false` のまま。
- `catch` でエラーメッセージを `error` state に保存して UI に表示する。
- ユーザーはボタンを再クリックして再試行できる（`setError(null)` が次回のハンドラ冒頭で実行される）。

## Saving Flag パターン（Saving Flag Pattern）

`generating: boolean` で実行中の二重呼び出しを防ぐ。

```typescript
<button disabled={generating} onClick={() => void handleGenerate()} type="button">
  {generating ? '生成中...' : 'JSONを生成して保存'}
</button>
```

- `try...finally` で成功・失敗どちらでも `setGenerating(false)` が呼ばれる。
- `saved === true` になった後はボタンを非表示にする（成功 UI に切り替え）ため、再生成は想定しない。

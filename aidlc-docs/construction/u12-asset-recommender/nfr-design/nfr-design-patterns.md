# NFR Design Patterns: U12-D 素材割り当て

## ローディングインデックスパターン（Loading Index Pattern）

`number | null` の単一状態で「どのシーンが選択中か」を管理する。

```typescript
const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

async function handleAssign(index: number) {
  if (loadingIndex !== null) return;  // 既に選択中なら無視
  setLoadingIndex(index);
  try {
    // asset.select() + asset.copy() ...
  } finally {
    setLoadingIndex(null);
  }
}
```

各シーンカードへの伝播:
```typescript
<SceneAssetCard
  isLoading={loadingIndex === index}      // このシーンが選択中
  disabled={loadingIndex !== null}         // いずれかのシーンが選択中
  onAssign={() => void handleAssign(index)}
  ...
/>
```

- `isLoading === true` のシーン: ボタンラベルを「選択中...」にする。
- `disabled === true` かつ `isLoading === false` のシーン: ボタンは disabled だが通常ラベル（「素材を選択」）。
- `finally` ブロックで必ず `setLoadingIndex(null)` を呼ぶ（成功・キャンセル・失敗すべて）。

## エラー自動クリアパターン（Auto-Clear Error Pattern）

`handleAssign` の冒頭でエラーをクリアしてから処理を開始する。

```typescript
async function handleAssign(index: number) {
  if (loadingIndex !== null) return;
  // 再試行時に前のエラーをクリア
  setErrors((prev) => {
    const next = {...prev};
    delete next[index];
    return next;
  });
  setLoadingIndex(index);
  try {
    const selection = await globalThis.localFileApi?.asset.select() ?? null;
    if (!selection) return;  // キャンセル: エラーなし

    const result = await globalThis.localFileApi?.asset.copy(videoId!, selection.token, true);
    if (!result || result.status === 'failed') {
      setErrors((prev) => ({...prev, [index]: result?.message ?? '素材のコピーに失敗しました。'}));
      return;
    }
    // 成功（copied または replacement-required）
    setScenes((prev) => prev.map((s, i) =>
      i === index ? {...s, assetPublicPath: result.publicPath, assetFileName: selection.fileName} : s
    ));
  } finally {
    setLoadingIndex(null);
  }
}
```

エラーは `handleClear` 時にも除去する:
```typescript
function handleClear(index: number) {
  setScenes((prev) => prev.map((s, i) => i === index ? {...s, assetPublicPath: null, assetFileName: null} : s));
  setErrors((prev) => {
    const next = {...prev};
    delete next[index];
    return next;
  });
}
```

## Overwrite-Always パターン（Overwrite-Always Pattern）

`asset.copy()` を常に `overwrite=true` で呼び出し、上書き確認ダイアログを省略する。

```typescript
const result = await globalThis.localFileApi?.asset.copy(videoId!, selection.token, true);
```

`AssetCopyResult` の処理:
```typescript
if (!result || result.status === 'failed') {
  // エラー処理
  return;
}
// 'copied' も 'replacement-required' も同じく publicPath を採用
const publicPath = result.publicPath;
```

`replacement-required` を `copied` と同等に扱うことで分岐を減らす。

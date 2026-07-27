# Tech Stack Decisions: U12-E VideoScript JSON 生成

## 新規 npm 依存

**なし。**

## 新規 IPC チャンネル

**なし。** `local-file:workspace-write-script` は U5 実装済みの `workspace.writeScript()` を使用する。

## 型追加

**なし。** `VideoScript` 等は `src/types/video.ts` の既存型をそのまま使用する。

## 状態管理

| 状態 | 型 | 場所 |
|---|---|---|
| `title` | `string` | `JsonGenerateTab` ローカル state（初期値 = videoId） |
| `generating` | `boolean` | `JsonGenerateTab` ローカル state |
| `saved` | `boolean` | `JsonGenerateTab` ローカル state |
| `error` | `string \| null` | `JsonGenerateTab` ローカル state |

## 既存 API の使用方法

```typescript
// input/{videoId}.json に書き込む
await globalThis.localFileApi?.workspace.writeScript(`${videoId}.json`, json);
```

`writeScript(fileName, data)` は `fileName` を `input/` 以下のファイル名として扱う。

## テストフレームワーク

Vitest（既存設定を使用）。`script-builder.ts` の純粋関数のみ対象。

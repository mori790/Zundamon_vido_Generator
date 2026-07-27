# NFR Requirements: U12-E VideoScript JSON 生成

## 信頼性

### Fail-Visible パターン
- `workspace.writeScript()` が失敗した場合、エラーメッセージを画面に表示する。
- `saved` は `false` のままにする（「ワークスペースを開く」ボタンは表示しない）。
- ユーザーは「JSONを生成して保存」ボタンを再クリックして再試行できる。
- `console.error` ではなく UI フィードバックを優先する。

### ダブル実行防止
- `generating: boolean` フラグ（Saving Flag パターン）でボタンを `disabled` にする。
- `try...finally` で必ず `setGenerating(false)` を呼ぶ（成功・失敗どちらでも）。

## パフォーマンス

- `buildVideoScript()` は同期処理・副作用なしのため、パフォーマンス上の懸念はない。
- `JSON.stringify` と `writeScript()` は UI スレッドで非同期実行する（ブロックなし）。
- 特別な最適化不要。

## テスト

- `src/studio/shared/script-builder.ts` の純粋関数のみ Vitest でカバーする。
- `JsonGenerateTab.tsx` は UI テストなし。
- テスト対象関数:
  - `resolveSceneType(index, total)`
  - `buildVideoScript(scenes, videoId, title)`

## セキュリティ

- `videoId` は上流（StudioContent の `workspace.videoId`）で検証済みのものを受け取る。
- U12-E 内で追加バリデーション不要。
- `title` はユーザー入力だが、JSON 文字列としてシリアライズされるため XSS リスクなし（Electron Renderer 内のみ）。

## 上書き

- Overwrite-Always パターン（Functional Design で決定済み）。
- `workspace.writeScript()` を直接呼び出す。既存ファイルの有無を事前確認しない。

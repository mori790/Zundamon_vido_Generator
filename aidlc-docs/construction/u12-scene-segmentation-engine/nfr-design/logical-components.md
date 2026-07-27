# Logical Components: U12-B AIシーン分割エンジン

## ロジカルコンポーネント概要

U12-B は純粋関数・Main process ハンドラ・Preload 公開・Renderer サービスの4層で構成する。IPC 境界で型を共有し、ロジックは純粋関数に分離してテスト可能にする。

## `buildSegmentationPrompt`（純粋関数層）

- **目的**: draftText を受け取り、Codex へ送信するプロンプト文字列を生成する。
- **シグネチャ**: `buildSegmentationPrompt(draftText: string): string`
- **場所**: `src/studio/shared/scene-segmentation.ts`
- **NFR役割**: 純粋関数のため Electron 不要。Vitest で直接テストする。プロンプトテンプレートのリグレッションを防ぐ。

## `parseSegmentationResponse`（純粋関数層）

- **目的**: Codex の応答テキストから `SegmentationResult` を生成する。
- **シグネチャ**: `parseSegmentationResponse(responseText: string): SegmentationResult`
- **場所**: `src/studio/shared/scene-segmentation.ts`
- **処理順序**:
  1. ` ```json ... ``` ` コードブロックを正規表現で抽出（見つからない場合 `[...` ブロックを探索）
  2. `JSON.parse()` を実行（失敗時: `parse-error`）
  3. Array チェック（失敗時: `parse-error`）
  4. 空配列チェック（`empty-result`）
  5. 各要素の title / narration / tags をフォールバック補完
  6. Scene ID 割り当て（`scene-001`, ...）
  7. `{ ok: true, scenes }` を返す
- **NFR役割**: 純粋関数のため Electron 不要。Vitest で境界値テストを実施する。

## `SceneSegmentationHandler`（Main Process 層）

- **目的**: `scene-segmentation:segment` IPC ハンドラ。Codex に送信し、ターン完了を待って SegmentationResult を返す。
- **場所**: `src/studio/main/main.ts` への追加
- **依存**: `codex`（既存 `CodexAppServerService` インスタンス）・`buildSegmentationPrompt`・`parseSegmentationResponse`
- **NFR役割**:
  - Listener-Before-Send パターン（`onEvent` 登録後に `send` 呼び出し）
  - Promise + 120秒タイムアウトパターン
  - すべてのコードパスで `unsub + clearTimeout` を呼び出すリソースクリーンアップ
  - Fail-Fast（どのエラーでも即 resolve）

## `sceneSegmentationApi`（Preload 層）

- **目的**: `scene-segmentation:segment` IPC チャンネルを Renderer に公開する。
- **場所**: `src/studio/main/preload.ts` への追加
- **シグネチャ**: `{ segment(draftText: string, videoId: string): Promise<SegmentationResult> }`
- **NFR役割**: `contextBridge.exposeInMainWorld('sceneSegmentationApi', ...)` で安全に公開する。型は `SceneSegmentationApi`（`scene-segmentation.ts` で定義）を `satisfies` で検証する。

## `SceneSegmentationService`（Renderer 層）

- **目的**: Renderer から segmentation IPC を呼び出し、結果を処理する関数群。
- **場所**: `src/studio/renderer/StudioApp.tsx`（または専用ファイル）
- **処理**:
  1. `new TextEncoder().encode(draftText).byteLength` で 64KB チェック（入力境界パターン）
  2. `globalThis.sceneSegmentationApi?.segment(draftText, videoId)` を呼び出す
  3. `ok: true` の場合: `SceneDraft` に `scenes` を追加して `draft.write()` を保存（Fail-Open）、シーン調整タブへ切り替え
  4. `ok: false` の場合: TextInputTab の `onSegmentationError(message)` を呼び出す
- **NFR役割**: 入力境界チェック（64KB超過の早期リジェクト）・Fail-Open保存パターンを担う。

## `SegmentationTestHelpers`（テストヘルパー層）

- **目的**: Vitest テスト用のサンプルデータと境界値定数を提供する。
- **内容**:
  - `VALID_JSON_RESPONSE`: 正常なJSONコードブロックを含むサンプル応答
  - `VALID_RAW_JSON_RESPONSE`: コードブロックなしの生JSONサンプル
  - `INVALID_JSON_RESPONSE`: 不正なJSONサンプル（パース失敗テスト用）
  - `EMPTY_ARRAY_RESPONSE`: 空配列JSONサンプル（empty-result テスト用）
  - `MISSING_FIELDS_RESPONSE`: フィールド欠損サンプル（フォールバックテスト用）
- **NFR役割**: テストの一貫性を保つ。同一サンプルで複数ケースを検証できる。

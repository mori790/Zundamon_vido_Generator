# Logical Components: U12-A テキスト入力パネル

## ロジカルコンポーネント概要

U12-Aは、テキスト入力からシーン分割委譲までを担う。各ロジカルコンポーネントは単一責任を持ち、純粋関数・サービス・フック・コンポーネントの4層に分かれる。

## `TextInputValidator`（純粋関数層）

- **目的**: テキスト入力のバリデーションロジックを担う。
- **入力**: `{ draftText: string; workspaceRoot: string | null }`
- **出力**: `TextInputValidationResult`（`{ ok: true }` または `{ ok: false; reason: 'empty-text' | 'no-workspace'; message: string }`）
- **NFR役割**: 純粋関数のため、ReactもElectronも不要。Vitestで直接テストする。

## `FileLoadHelper`（純粋関数層 + IPC境界）

- **目的**: ファイル拡張子チェック・ファイルサイズチェック・IPCを通じたファイル読み込みを担う。
- **入力**: ファイルパスまたはIPCレスポンス結果
- **出力**: `FileLoadResult`（`{ ok: true; text: string; fileName: string }` または `{ ok: false; reason: 'unsupported-format' | 'file-too-large' | 'read-error'; message: string }`）
- **NFR役割**: Fail-Closed検証を担う。拡張子チェック・サイズチェックは純粋関数として抽出してVitestでテストする。IPC呼び出し部分はモックで検証する。

## `useDraftSave`（Reactカスタムフック層）

- **目的**: 500msデバウンスによるドラフト保存を担う。
- **入力**: `{ draftText: string; workspaceRoot: string | null; videoId: string }`
- **動作**: `draftText` の変更を監視し、500ms後に `DraftPersistenceService.save` を非同期呼び出しする。保存失敗はコンソールログのみ。アンマウント時にタイマーをクリアする。
- **NFR役割**: Fail-Open保存パターンとデバウンスパターンを担う。

## `DraftPersistenceService`（サービス層）

- **目的**: `draft-{videoId}.json` の読み書きを担う。
- **関数**:
  - `saveDraft(workspaceRoot: string, videoId: string, draftText: string): Promise<void>`
  - `loadDraft(workspaceRoot: string, videoId: string): Promise<TextInputDraft | null>`
- **NFR役割**: IPC経由でワークスペースフォルダ内にのみ書き込む。失敗時は `console.error` のみ。`workspaceRoot` を引数として受け取るため、テスト時にモック可能。

## `TextInputTab`（Reactコンポーネント層）

- **目的**: テキスト入力パネルのコンテナコンポーネント。`TextInputState` を管理し、子コンポーネント（TextInputArea, FileLoadButton, SegmentationButton, TextInputStatusMessage）を束ねる。
- **入力**: `{ workspaceRoot: string | null; videoId: string; onSegmentationStart: (text: string) => void }`
- **NFR役割**: `useDraftSave` フックを利用して保存状態をUIから分離する。シーン分割中はすべての入力コントロールを無効化してUIフリーズを防ぐ。タブは常に表示する。

## `TextInputTestHelpers`（テストヘルパー層）

- **目的**: Vitest向けのテストヘルパーと境界値ケース定数を提供する。
- **内容**:
  - `MAX_FILE_SIZE_BYTES = 1_048_576`（1MB境界値）
  - 許可拡張子リスト `['.txt', '.md']`
  - モックDraftPersistenceService（成功・失敗・遅延の各バリアント）
- **NFR役割**: テスト重複を避け、境界値テストの一貫性を担保する。

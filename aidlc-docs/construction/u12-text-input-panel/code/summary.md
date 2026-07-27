# Code Summary: U12-A テキスト入力パネル

## 生成ファイル一覧

### 新規作成

| ファイル | 役割 |
|---|---|
| `src/studio/shared/text-input-draft.ts` | TextInputDraft / TextInputState / TextInputValidationResult / FileLoadResult 型定義。validateTextInput / checkFileExtension / checkFileSize 純粋関数。MAX_DRAFT_FILE_BYTES 定数。 |
| `src/studio/renderer/TextInputArea.tsx` | テキストエリアコンポーネント（min-height: 200px・プレースホルダ・disabled対応） |
| `src/studio/renderer/TextInputStatusMessage.tsx` | バリデーションエラー・セグメンテーションエラーのインライン表示 |
| `src/studio/renderer/SegmentationButton.tsx` | 「シーンに分割する」ボタン（有効条件ロジック・処理中ラベル） |
| `src/studio/renderer/FileLoadButton.tsx` | ファイル選択ダイアログ・拡張子/サイズ検証・上書き確認ダイアログ統合 |
| `src/studio/renderer/TextInputTab.tsx` | コンテナ（TextInputState管理・500msデバウンス保存・ドラフト復元・子コンポーネント統合） |
| `tests/studio/text-input-validation.test.ts` | validateTextInput / checkFileExtension / checkFileSize の単体テスト（境界値含む） |
| `tests/studio/draft-persistence.test.ts` | DraftPersistenceService（LocalFileApi.draft）のモック単体テスト |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/studio/shared/local-file.ts` | LocalFileApi に `draft` 名前空間を追加（read / write）。TextInputFileApi 型を追加（openFileDialog / readTextFile）。 |
| `src/studio/main/local-file-service.ts` | draft 名前空間を実装（`generated/studio/{videoId}/draft-text.json` への confined 読み書き）。 |
| `src/studio/main/main.ts` | `node:fs/promises` の readFile / stat を追加。IPC ハンドラ 4件を追加（local-file:read-draft / local-file:write-draft / text-input:open-file-dialog / text-input:read-file）。 |
| `src/studio/main/preload.ts` | TextInputFileApi 型をインポート。localFileApi.draft（read / write）を追加。textInputFileApi を contextBridge で公開。 |
| `src/studio/renderer/StudioApp.tsx` | TextInputTab をインポート。MainTab 型を追加。StudioContent に workspaceRoot prop と activeTab 状態を追加。タブバー UI（ワークスペース / テキスト入力）を追加。StudioApp から workspaceRoot を StudioContent へ渡す。 |
| `tests/studio/asset.test.ts` | LocalFileApi モックに `draft: {} as never` を追加（型エラー修正）。 |

## ストーリー受入条件マッピング

### US-1: テキストエリアへの草案貼り付け

| 受入条件 | 実装箇所 |
|---|---|
| 任意テキストをペーストして全文が表示される | TextInputArea（value/onChange） |
| シーン分割開始ボタンが有効になる | SegmentationButton（有効条件: text.trim() + workspaceSelected） |
| 空入力で「テキストを入力してください」エラー | validateTextInput（empty-text）→ TextInputStatusMessage |
| 処理が始まらない | SegmentationButton が disabled → handleSegmentationStart で early return |

### US-2: テキストファイルの読み込み

| 受入条件 | 実装箇所 |
|---|---|
| .txt / .md ファイルの内容がテキストエリアに展開される | FileLoadButton → textInputFileApi.readTextFile → onLoad |
| .txt / .md 以外でエラー表示 | checkFileExtension → window.alert（FileLoadButton内） |
| テキストエリアは変更しない（エラー時） | onLoad を呼ばずにreturn |

## 検証結果

- `npx tsc --noEmit`: エラー 0
- `npm test`: 164テスト全PASS（40テストファイル）
- `npm run studio:build`: 成功

# Code Generation Plan: U12-A テキスト入力パネル

## ユニットコンテキスト

- **ユニット**: U12-A テキスト入力パネル
- **目標**: テキストエリアへの草案貼り付け・.txt/.md ファイル読み込み・バリデーション・500msデバウンスドラフト保存・シーン分割開始委譲・タブ追加 を実装する。
- **対象ストーリー**: US-1（草案貼り付け）、US-2（ファイル読み込み）
- **依存**: U1（Workspace選択IPC）、U2（Codex IPC、シーン分割委譲先）、既存 `local-file-service`
- **スコープ外**: シーン分割処理本体（U12-B）、素材推薦（U12-D）、JSON生成（U12-E）

## ターゲットコードロケーション

### 新規作成ファイル

| ファイル | 役割 |
|---|---|
| `src/studio/shared/text-input-draft.ts` | TextInputDraft / TextInputState / TextInputValidationResult / FileLoadResult 型定義。純粋バリデーション関数（validateTextInput）・ファイル検証関数（checkFileExtension / checkFileSize）を含む。 |
| `src/studio/renderer/TextInputTab.tsx` | TextInputTab コンテナ（TextInputState管理・useDraftSaveフック内蔵・子コンポーネント統合） |
| `src/studio/renderer/TextInputArea.tsx` | テキストエリアサブコンポーネント（min-height: 200px・プレースホルダ付き） |
| `src/studio/renderer/FileLoadButton.tsx` | ファイル選択ダイアログボタン（テキスト上書き確認ダイアログ含む） |
| `src/studio/renderer/SegmentationButton.tsx` | 「シーンに分割する」ボタン（有効条件ロジック・スピナー表示） |
| `src/studio/renderer/TextInputStatusMessage.tsx` | インラインエラー・案内メッセージ表示 |
| `tests/studio/text-input-validation.test.ts` | TextInputValidator・checkFileExtension・checkFileSize の単体テスト |
| `tests/studio/draft-persistence.test.ts` | DraftPersistenceService（saveDraft / loadDraft）の単体テスト |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/studio/shared/local-file.ts` | `LocalFileApi` に `draft` 名前空間を追加（`readDraft(videoId): Promise<string \| null>` / `writeDraft(videoId, data): Promise<void>`）。`TextInputFileApi` 型を追加（`openFileDialog(): Promise<{filePath: string; fileName: string} \| null>` / `readTextFile(filePath): Promise<{content: string; byteSize: number}>`）。 |
| `src/studio/main/local-file-service.ts` | `draft` 名前空間を実装（`generated/studio/{videoId}/draft-text.json` への読み書き、`confined` で Workspace 境界を守る）。 |
| `src/studio/main/main.ts` | IPCハンドラを追加: `local-file:read-draft` / `local-file:write-draft` / `text-input:open-file-dialog` / `text-input:read-file`。 |
| `src/studio/main/preload.ts` | `localFileApi.draft` と `textInputFileApi` を `contextBridge.exposeInMainWorld` で公開する。 |
| `src/studio/renderer/StudioApp.tsx` | タブバーに「テキスト入力」タブを追加し、`TextInputTab` を常時マウントする。 |

### ドキュメント成果物

| ファイル | 内容 |
|---|---|
| `aidlc-docs/construction/u12-text-input-panel/code/summary.md` | 生成・変更ファイル一覧と US-1 / US-2 への対応マッピング |

## 計画依存関係

新規 npm 依存なし（既存 Electron / React / Vitest / TypeScript を継続使用する）。

## ステップ別生成計画

### Step 1: 型定義と純粋ロジック

- [ ] `src/studio/shared/text-input-draft.ts` を作成する。
  - `TextInputDraft` / `TextInputState` / `TextInputStatus` / `TextInputValidationResult` / `FileLoadResult` を定義する。
  - `validateTextInput({ draftText, workspaceRoot })` を純粋関数として実装する。
  - `checkFileExtension(fileName: string): boolean`（`.txt` / `.md` のみ `true`）を実装する。
  - `checkFileSize(byteSize: number): boolean`（1,048,576 bytes 以下で `true`）を実装する。
  - `MAX_DRAFT_FILE_BYTES = 1_048_576` 定数を公開する。
- [ ] `src/studio/shared/local-file.ts` に `draft` 名前空間と `TextInputFileApi` 型を追加する。

### Step 2: Main process 拡張

- [ ] `src/studio/main/local-file-service.ts` に `draft` 名前空間を追加する。
  - `readDraft(videoId)`: `generated/studio/{videoId}/draft-text.json` を読む。ENOENT は `null` を返す。
  - `writeDraft(videoId, data)`: 同パスに書く。`mkdir({ recursive: true })` でディレクトリを保証する。`confined` でパス境界を検証する。
- [ ] `src/studio/main/main.ts` に IPCハンドラを追加する。
  - `local-file:read-draft` → `localFileService.draft.readDraft(videoId)`
  - `local-file:write-draft` → `localFileService.draft.writeDraft(videoId, data)`
  - `text-input:open-file-dialog` → `dialog.showOpenDialog({ properties: ['openFile'], filters: [{name: 'Text', extensions: ['txt', 'md']}] })`。キャンセル時は `null` を返す。
  - `text-input:read-file` → `fs.stat(filePath)` でサイズを取得し、`fs.readFile(filePath, 'utf8')` で内容を返す。パスが Workspace 外でも読む（ユーザーが明示選択したファイル）。ただし Workspace 内ファイルは別の IPC で扱う。

### Step 3: Preload 拡張

- [ ] `src/studio/main/preload.ts` に追加する。
  - `localFileApi.draft` = `{ readDraft, writeDraft }` を IPC 経由で公開する。
  - `textInputFileApi` = `{ openFileDialog, readTextFile }` を新しい `contextBridge.exposeInMainWorld` で公開する。

### Step 4: Reactサブコンポーネント

- [ ] `src/studio/renderer/TextInputArea.tsx` を作成する。Props: `value`, `onChange`, `disabled`。min-height: 200px。プレースホルダ: 「動画の草案テキストを貼り付けてください」。
- [ ] `src/studio/renderer/TextInputStatusMessage.tsx` を作成する。`validationResult` と `errorMessage` を受け取り、条件に応じてインラインメッセージを表示する。表示条件外では `null` を返す。
- [ ] `src/studio/renderer/SegmentationButton.tsx` を作成する。有効条件: `draftText.trim()` が空でなく、`workspaceSelected === true` で、`status` が `'segmenting'` 以外。処理中ラベル「分割中...」にスピナーアイコン（既存UIパターンに合わせる）。
- [ ] `src/studio/renderer/FileLoadButton.tsx` を作成する。クリック時に `textInputFileApi.openFileDialog()` を呼ぶ。`null` はキャンセルとして処理終了。パス取得後 `checkFileExtension` でチェック。失敗時はエラーダイアログ表示。既存テキストがある場合は確認ダイアログ（`dialog.showMessageBox` IPC 経由 or `window.confirm`）を表示し、承認なら `textInputFileApi.readTextFile` を呼んで `onLoad` コールバックを実行する。1MB 超は `checkFileSize` で弾きエラーダイアログを表示する。

### Step 5: TextInputTab コンテナ

- [ ] `src/studio/renderer/TextInputTab.tsx` を作成する。
  - `TextInputState` をローカルステートで管理する。
  - `useEffect` + `setTimeout/clearTimeout` で 500ms デバウンス保存（`useDraftSave` ロジックをコンポーネント内の `useEffect` として実装する。将来の抽出が容易なように、保存ロジックはコメントで境界を示す）。
  - Workspace 選択時（`workspaceRoot` が非 null のとき）に `localFileApi.draft.readDraft(videoId)` でドラフトを復元する。
  - 保存失敗は `console.error` のみ。
  - Props: `workspaceRoot: string | null`, `videoId: string`, `onSegmentationRequest: (text: string) => void`

### Step 6: StudioApp 統合

- [ ] `src/studio/renderer/StudioApp.tsx` を変更する。
  - 既存タブバーに「テキスト入力」タブを追加する（常時表示）。
  - `TextInputTab` をレンダリングし、`onSegmentationRequest` には現時点では `console.log` スタブ（U12-B 実装まで）を渡す。
  - 他の既存タブの動作を変更しない。

### Step 7: 単体テスト

- [ ] `tests/studio/text-input-validation.test.ts` を作成する。
  - `validateTextInput` の正常系（テキストあり・Workspace あり）をテストする。
  - `validateTextInput` の失敗系（空テキスト・Workspace 未選択）をテストする。
  - `checkFileExtension` の許可拡張子（`.txt`, `.md`）と拒否拡張子（`.pdf`, `.docx` 等）をテストする。
  - `checkFileSize` の境界値テスト（1,048,576 bytes はOK、1,048,577 bytes はNG）をテストする。
- [ ] `tests/studio/draft-persistence.test.ts` を作成する。
  - 保存成功ケース（`writeDraft` → `readDraft` 往復）をモックで検証する。
  - 保存失敗ケース（`writeFile` がエラーを投げる場合）はエラーが呼び出し元へ伝播することを確認する（TextInputTab でキャッチして `console.error` にする）。
  - ENOENT 時に `null` を返すことをテストする。

### Step 8: コードサマリー生成

- [ ] `aidlc-docs/construction/u12-text-input-panel/code/summary.md` を作成する。
  - 生成ファイル・変更ファイルを列挙する。
  - US-1・US-2 への受入条件マッピングを記載する。

### Step 9: 検証

- [ ] `npx tsc --noEmit` を実行してTypeScriptエラーがゼロであることを確認する。
- [ ] `npm test` を実行して全テストがPASSすることを確認する。
- [ ] `npm run studio:build` を実行してビルドが成功することを確認する。

## ストーリートレーサビリティ

| ストーリー | カバー内容 |
|---|---|
| US-1 | TextInputArea（貼り付け入力）・validateTextInput（空テキスト拒否）・SegmentationButton（有効条件）・TextInputStatusMessage（エラー表示）がカバー |
| US-2 | FileLoadButton（ファイル選択ダイアログ・拡張子チェック・1MB上限・上書き確認）がカバー |

## 承認ゲート

このプランはU12-A Code Generationの実装根拠となる。コード変更はこのプランの承認後に開始する。

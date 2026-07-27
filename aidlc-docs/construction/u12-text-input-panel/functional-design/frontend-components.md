# Frontend Components: U12-A テキスト入力パネル

## TextInputTab

- **種別**: タブパネル（Studioメインエリアへの追加タブ）
- **表示条件**: 常に表示（Workspace選択の有無を問わない）
- **役割**: テキスト入力パネル全体のコンテナ。TextInputAreaとFileLoadButtonとSegmentationButtonを統合する。
- **ステート管理**: `TextInputState`（draftText・status・errorMessage）をローカルステートで管理する。
- **副作用**:
  - draftText変更時にデバウンス（500ms）後、DraftPersistenceServiceに保存する（Workspace選択済みの場合のみ）。
  - Workspace選択時に `draft-{id}.json` から `draftText` を復元する。
- **子コンポーネント**: TextInputArea、FileLoadButton、SegmentationButton、TextInputStatusMessage

---

## TextInputArea

- **種別**: テキストエリア
- **役割**: 草案テキストの入力・表示・編集。
- **Props**:
  - `value: string` — 現在のテキスト内容
  - `onChange: (text: string) => void` — テキスト変更コールバック
  - `disabled: boolean` — シーン分割中は無効化
- **表示**: スクロール可能な縦伸縮テキストエリア（最小高さ: 200px）
- **プレースホルダ**: 「動画の草案テキストを貼り付けてください」

---

## FileLoadButton

- **種別**: ボタン
- **役割**: ファイル選択ダイアログを開き、`.txt` / `.md` の内容をTextInputAreaに展開する。
- **Props**:
  - `onLoad: (text: string) => void` — 読み込んだテキストを渡すコールバック
  - `disabled: boolean` — シーン分割中は無効化
- **挙動**:
  1. Electronの `dialog.showOpenDialog` を呼び出す（フィルタ: `.txt`, `.md`）。
  2. 選択ファイルが `.txt` / `.md` 以外：エラーダイアログを表示して終了。
  3. TextInputAreaに既存テキストがある場合：確認ダイアログを表示。承認なら onLoad を呼ぶ。
  4. TextInputAreaが空の場合：確認なしで onLoad を呼ぶ。

---

## SegmentationButton

- **種別**: プライマリボタン
- **役割**: バリデーション後にAIシーン分割を開始する。
- **Props**:
  - `text: string` — 現在のテキスト内容
  - `workspaceSelected: boolean` — Workspace選択済みか
  - `status: TextInputStatus` — 現在のステータス
  - `onStart: () => void` — 分割開始コールバック
- **有効条件**: `text.trim()` が空でなく、`workspaceSelected` が true で、`status` が `'idle'` または `'has-text'` または `'segmentation-error'`
- **表示ラベル**: 通常時「シーンに分割する」 / 処理中「分割中...」（Spinnerアイコン付き）

---

## TextInputStatusMessage

- **種別**: インラインメッセージ（エラー・案内）
- **役割**: バリデーションエラー・Codexエラー・Workspace未選択案内を表示する。
- **Props**:
  - `validationResult: TextInputValidationResult | null`
  - `errorMessage: string | null`
- **表示ケース**:
  - `empty-text`: 「テキストを入力してください」
  - `no-workspace`: 「Workspaceを選択してからシーンに分割してください」
  - `segmentation-error`: errorMessageの内容（例: 「シーン分割に失敗しました。Codex接続を確認してください」）
  - それ以外: 非表示

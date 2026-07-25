# NFR Design Plan: U3 JSON下書きレビューとシーン編集

## ユニットの前提

- **Unit**: U3 JSON Draft Review and Scene Editing.
- **目的**: U3 NFR Requirementsで決めた性能、保存安全性、アクセシビリティ、テスト容易性を設計パターンと論理コンポーネントへ落とし込む。
- **対象**: Draft State、Raw JSON編集、構造化シーン編集、Apply/Backup、Validation、ScriptReviewPanel。
- **対象外**: 実Codex提案連携、画像ファイル選択、コマンド実行、Preview、Render。

## NFR Design作成手順

### Step 1: 保存安全性パターン

- [x] Apply処理の順序を定義する。
- [x] バックアップ作成失敗時の停止パターンを定義する。
- [x] 正式JSON保存失敗時の下書き保持パターンを定義する。

### Step 2: 性能パターン

- [x] Raw JSONバリデーションのデバウンスパターンを定義する。
- [x] 100シーン以下の構造化編集で避けるべき重い処理を定義する。
- [x] 検証結果と編集中状態の世代管理パターンを定義する。

### Step 3: UI/アクセシビリティパターン

- [x] 読み取り専用、下書き、無効、適用済みの状態表示パターンを定義する。
- [x] タブとフォームのキーボード操作パターンを定義する。
- [x] エラー表示とApply可否表示のパターンを定義する。

### Step 4: 論理コンポーネント

- [x] Draft State Controllerを定義する。
- [x] Draft Validatorを定義する。
- [x] Script Apply Adapterを定義する。
- [x] Script Review UI componentsを定義する。
- [x] Test seamsを定義する。

### Step 5: NFR Design成果物の作成

- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/nfr-design/nfr-design-patterns.md`.
- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/nfr-design/logical-components.md`.

## 確認質問

各質問について、`[Answer]:` の後に該当する選択肢のアルファベットを記入してください。どの選択肢も合わない場合は、最後の「その他」を選び、希望内容を追記してください。

## 質問 1
Applyで正式JSON保存に失敗した場合、画面上ではどの復旧導線を優先しますか？

A) 下書きを保持し、エラー表示と再Applyボタンを出す

B) 下書きを保持し、エラー表示だけ出してユーザーにRaw JSON修正を促す

C) バックアップから自動復元を試み、復元結果を表示する

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## 質問 2
100シーン以下を扱うための初回実装の性能パターンはどこまで入れますか？

A) デバウンス検証と不要な再計算を避ける程度にする

B) デバウンス検証に加えて、シーン行のメモ化まで入れる

C) 仮想スクロールなど大規模リスト向け最適化まで入れる

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## 質問 3
Raw JSONが無効な間、構造化ビューの「最後の有効状態」はどう表示しますか？

A) 構造化ビューは表示したまま、古い状態である注意バナーを出す

B) 構造化ビューは表示するが、編集を無効化する

C) 構造化ビューには切り替え不可にする

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## 質問 4
ファイル保存ロジックはどの境界に置くべきですか？

A) `src/studio/renderer/`の専用アダプタに置く

B) `src/studio/shared/`に置き、UIから直接使う

C) 今後のIPC化を見据えて`src/studio/main/`側に置く

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: b

## コンテンツ検証

- Mermaid図は含まない。
- ASCII図は含まない。
- 質問文と選択肢は日本語。
- `[Answer]:`タグ形式を使用。

## 承認ゲート

すべての質問に回答され、内容を検証した後にNFR Design成果物を作成する。

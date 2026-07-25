# NFR Requirements Plan: U3 JSON下書きレビューとシーン編集

## ユニットの前提

- **Unit**: U3 JSON Draft Review and Scene Editing.
- **目的**: 応答性が高く、安全に保存でき、テストしやすいJSON下書きレビューとシーン編集画面を追加する。
- **主なリスク**:
  - 正式な`input/{videoId}.json`を誤って上書きする。
  - Raw JSONエディタと構造化エディタの状態がずれる。
  - 大きめの台本で入力やバリデーションが重くなる。
  - 操作項目やタブが多くなり、アクセシビリティが低下する。
- **有効な拡張ルール**: なし。Security、Resiliency、Property-Based Testingは`aidlc-docs/aidlc-state.md`で無効。

## NFR Requirements作成手順

### Step 1: 性能と応答性

- [x] 入力やシーン編集時の目標応答性を定義する。
- [x] バリデーションのタイミングと待機時間の考え方を定義する。
- [x] U3 MVPで許容する台本サイズを定義する。

### Step 2: ファイル安全性と復旧性

- [x] Apply前のバックアップ動作を定義する。
- [x] バックアップが既に存在する場合の動作を定義する。
- [x] 保存失敗時の動作を定義する。
- [x] 失敗後に下書きを保持するルールを定義する。

### Step 3: 使いやすさとアクセシビリティ

- [x] タブとフォームに対するキーボード操作やスクリーンリーダー対応の期待値を定義する。
- [x] 読み取り専用、下書き、無効、適用済み状態の見分けやすさを定義する。
- [x] Electron GUIとしてモバイル制約を考慮するか定義する。

### Step 4: 保守性とテスト容易性

- [x] 下書きロジックをReactコンポーネントから分離する方針を定義する。
- [x] 状態ロジック、ファイルアダプタ、コンポーネントのテスト範囲を定義する。
- [x] エディタUI部品の技術選定を定義する。

### Step 5: NFR Requirements成果物の作成

- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/nfr-requirements/nfr-requirements.md`.
- [x] Create `aidlc-docs/construction/u3-json-draft-review-and-scene-editing/nfr-requirements/tech-stack-decisions.md`.

## 確認質問

各質問について、`[Answer]:` の後に該当する選択肢のアルファベットを記入してください。どの選択肢も合わない場合は、最後の「その他」を選び、希望内容を追記してください。

## 質問 1
U3 MVPのエディタは、どのくらいの台本サイズまで滑らかに扱えることを目標にしますか？

A) 短いMVP動画向け。おおよそ10シーン以下

B) 一般的な動画向け。おおよそ30シーン以下

C) 長めの動画向け。おおよそ80シーン以下

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: c

## 質問 2
Raw JSONを編集中のバリデーションは、どのタイミングで行うべきですか？

A) 編集のたびに即時バリデーションする

B) 入力が重くならないよう、短い待機時間の後にバリデーションする

C) ユーザーがValidateまたはApplyを押したときだけバリデーションする

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: b

## 質問 3
Applyを押した時点で`input/{videoId}.json.bak`が既に存在する場合、どう扱うべきですか？

A) 既存の`.bak`を上書きする

B) 既存の`.bak`は残し、日時付きバックアップを別に作る

C) Applyを止め、既存バックアップの削除またはリネームをユーザーに求める

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## 質問 4
U3の初回実装では、キーボードアクセシビリティをどの程度まで目標にしますか？

A) 基本対応。通常のブラウザフォーカスで全操作をキーボード利用できる

B) しっかり対応。キーボード操作に加えて、明確なタブ/ボタンラベルと見えるフォーカス状態を用意する

C) 最小対応。ローカルMVPとしてマウス操作を優先し、アクセシビリティ改善は後回しにする

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## 質問 5
U3の初回実装では、Raw JSONエディタに何を使うべきですか？

A) 標準の`textarea`を使う

B) CodeMirrorなどのエディタライブラリを使う

C) まずは読み取り専用JSONビューアにし、Raw JSON編集は後で対応する

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## 質問 6
U3ではどの程度の深さでテストを書くべきですか？

A) 下書き状態ロジック、保存/Applyアダプタ、主要コンポーネント操作に絞ってテストする

B) 各シーン項目とRaw JSONエラー経路の細かいケースまで広くテストする

C) まだプロトタイプなので、最小限のスモークテストだけにする

D) その他。[Answer]: の後に希望内容を記入する

[Answer]: a

## コンテンツ検証

- No Mermaid diagrams are included.
- No ASCII diagrams are included.
- Markdown question format follows the required `[Answer]:` tag structure.

## 承認ゲート

すべての質問に回答され、内容を検証した後にNFR Requirements成果物を作成する。

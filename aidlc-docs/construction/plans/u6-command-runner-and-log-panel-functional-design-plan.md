# 機能設計計画: U6 コマンド実行とログパネル

## ユニットコンテキスト

- **ユニット**: U6 コマンド実行とログパネル。
- **目的**: Studio GUIから既存の生成パイプラインコマンドを実行し、ログをストリーミング表示し、操作状態を示し、競合する操作を防ぎ、Codexが利用できない場合でも手動作業を継続できるようにする。
- **主要ストーリー**: US-12, US-13, US-14, US-17。
- **支援ストーリー**: US-2, US-11, US-15, US-16, US-18, US-19, US-20。
- **依存先**: U1 Electron App Shell and Workspace Foundation。
- **並列化境界**: U6はU3と並列に進められる。ただしU6は `input/{videoId}.json` に保存済みのアクティブスクリプトだけを実行対象にし、未適用のU3ドラフトは対象にしない。
- **U6の範囲外**: JSONドラフト編集、Codex提案の承認ルーティング、アセット選択、埋め込みプレビュー本体、最終レンダー互換性検証。

## ステップ別機能設計計画

### ステップ1: コマンドドメインモデル

- [x] 対応するコマンド種別と表示名を定義する。
- [x] コマンド入力パラメータと許可するフラグを定義する。
- [x] コマンドライフサイクル状態を定義する。
- [x] コマンド結果と終了コードの意味を定義する。
- [x] 操作IDとタイムスタンプを定義する。

### ステップ2: 実行ビジネスロジック

- [x] GUIからコマンドを開始する流れを定義する。
- [x] Electron main process側の実行境界を定義する。
- [x] stdoutとstderrのストリーミング挙動を定義する。
- [x] コマンド完了時と失敗時の挙動を定義する。
- [x] キャンセル対応の有無と挙動を定義する。

### ステップ3: コマンド順序と競合ルール

- [x] 同時実行できる操作とできない操作を定義する。
- [x] voice、timeline、preview、render実行前の前提チェックを定義する。
- [x] アクティブスクリプトが存在しない場合の挙動を定義する。
- [x] 生成済みアーティファクトが古い、または存在しない場合の挙動を定義する。

### ステップ4: エラー処理と復旧ルール

- [x] validation失敗の表示を定義する。
- [x] VOICEVOX未起動時の表示を定義する。
- [x] Remotionプロセス失敗時の表示を定義する。
- [x] リトライ挙動を定義する。
- [x] ログ保持とクリア操作を定義する。

### ステップ5: フロントエンドコンポーネント設計

- [x] コマンドパネルのコンポーネント階層を定義する。
- [x] 操作ステータス表示を定義する。
- [x] ログパネルの操作を定義する。
- [x] 現在のワークスペースシェルとの統合を定義する。
- [x] U4 Codex承認とU7プレビューへの将来接続点を定義する。

### ステップ6: 機能設計成果物の生成

- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/functional-design/business-logic-model.md` を作成する。
- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/functional-design/business-rules.md` を作成する。
- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/functional-design/domain-entities.md` を作成する。
- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/functional-design/frontend-components.md` を作成する。

## 確認質問

各質問について、`[Answer]:` タグの後ろに選択肢の文字を記入してください。選択肢が意図に合わない場合は最後の「その他」を選び、内容を追記してください。

## 質問1
U6の最初の実装で、どのコマンドボタンを表示しますか？

A) Validate、Voice、Timeline、Preview、Renderをすべて表示する

B) Validate、Voice、Timelineのみ表示し、PreviewとRenderはU7/U8まで待つ

C) まずValidateのみ表示し、他のコマンドは基本実行が安定してから追加する

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問2
U6では同時実行をどのように扱いますか？

A) ワークスペース全体で常に1コマンドだけ実行できるようにする

B) 他のコマンド実行中でもValidateだけは許可し、Voice、Timeline、Preview、Renderの競合はブロックする

C) 複数コマンドの同時実行を許可し、競合処理は既存スクリプト側に任せる

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: b

## 質問3
U6の最初の実装で、実行中コマンドのキャンセルをサポートしますか？

A) はい。長時間実行されるコマンドにはStopを用意し、spawnしたプロセスを終了する

B) PreviewだけStopをサポートする。Previewは起動したまま残る可能性があるため

C) いいえ。最初は状態とログ表示のみとし、キャンセルは後続で扱う

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問4
U6のログ保持はどの方式にしますか？

A) 現在のStudioセッション中だけメモリに保持する

B) メモリに保持し、後で手動コピーやダウンロードを可能にする

C) `generated/studio/{videoId}/logs/` に永続保存する

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問5
Voice、Timeline、Preview、Renderを実行する前に、U6が自動でValidateを実行しますか？

A) はい。先にValidateを実行し、失敗したら要求されたコマンドをブロックする

B) Validate未成功の場合は警告するが、ユーザーが実行を継続できるようにする

C) 自動Validateは追加しない。各ボタンはそのコマンドだけを実行する

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問6
U3が並列開発中の未保存または未適用ドラフトを、U6ではどのように扱いますか？

A) ドラフトは無視し、`input/{videoId}.json` だけを対象にする

B) ドラフトが存在する間は、ドラフトが適用または破棄されるまで全コマンドを無効化する

C) ドラフト内容のValidateだけは許可し、生成系コマンドは適用済みスクリプトだけを対象にする

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式は必須の `[Answer]:` タグ構造に従っている。

## 承認ゲート

すべての質問が回答され、回答内容が検証されるまで、機能設計成果物は生成しない。

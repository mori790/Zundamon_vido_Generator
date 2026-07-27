# NFR Requirements Plan: U6 コマンド実行とログパネル

## ユニットコンテキスト

- **ユニット**: U6 コマンド実行とログパネル。
- **前段承認**: Functional Design承認済み。
- **主要NFR観点**: UI応答性、長時間プロセス管理、ログメモリ上限、プロセス停止の信頼性、既存CLI互換性、テスト容易性。
- **並列化境界**: U3の現在ステージは別タブで進行中のため、U6はParallel Workstreamとして進める。U6 NFRは保存済み `input/{videoId}.json` に対するコマンド実行だけを対象にする。

## Step-by-Step NFR Requirements Plan

### Step 1: パフォーマンス要件

- [x] コマンド開始後にUIが状態変化を表示する目標時間を定義する。
- [x] ログストリーミング表示の更新粒度を定義する。
- [x] 大量ログ発生時のメモリ上限と切り詰め方を定義する。

### Step 2: 信頼性要件

- [x] 子プロセス起動失敗時の扱いを定義する。
- [x] Stop要求後の終了猶予と強制終了の扱いを定義する。
- [x] Previewのような長時間プロセスの終了扱いを定義する。
- [x] 失敗後の再実行要件を定義する。

### Step 3: 安全性と境界要件

- [x] 実行可能コマンドを固定マッピングに限定する要件を定義する。
- [x] `videoId` と引数の扱いを定義する。
- [x] U3ドラフトを対象外にする境界を定義する。

### Step 4: 可用性とユーザビリティ要件

- [x] Codex接続なしでもコマンド操作できる要件を定義する。
- [x] VOICEVOX未起動やRemotion失敗をユーザーが理解できる表示要件を定義する。
- [x] 長時間処理中もStudio UIが操作不能にならない要件を定義する。

### Step 5: テストと技術選定

- [x] Electron main processのspawn境界テスト方針を定義する。
- [x] Renderer側のボタン状態、ログ表示、Stop操作のテスト方針を定義する。
- [x] 既存npm scriptsを再利用するか、core serviceを直接呼ぶかの技術判断を定義する。

### Step 6: NFR Requirements成果物の生成

- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/nfr-requirements/nfr-requirements.md` を作成する。
- [x] `aidlc-docs/construction/u6-command-runner-and-log-panel/nfr-requirements/tech-stack-decisions.md` を作成する。

## 確認質問

各質問について、`[Answer]:` タグの後ろに選択肢の文字を記入してください。選択肢が意図に合わない場合は最後の「その他」を選び、内容を追記してください。

## 質問1
コマンド開始後、GUI上の状態表示はどの程度の速さで更新されるべきですか？

A) 200ms以内を目標にする

B) 500ms以内を目標にする

C) 1秒以内なら許容する

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問2
セッション内メモリログの上限はどうしますか？

A) Operationごとに最新1,000行まで保持する

B) Operationごとに最新5,000行まで保持する

C) 行数ではなくOperationごとに最大1MBまで保持する

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問3
Stop要求後、プロセスが自然終了しない場合の扱いはどうしますか？

A) 3秒待ってから強制終了を試みる

B) 10秒待ってから強制終了を試みる

C) 強制終了はせず、Stop要求済みとして表示し続ける

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: b

## 質問4
U6実装では、既存のnpm scriptsとcore service直接呼び出しのどちらを優先しますか？

A) 既存CLI互換性を優先し、Electron main processからnpm scriptsをspawnする

B) 型安全性と細かい状態制御を優先し、可能な範囲でcore serviceを直接呼ぶ

C) Validateだけcore serviceを直接呼び、他はnpm scriptsをspawnする

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問5
VOICEVOX未起動など外部依存エラーの表示粒度はどうしますか？

A) ログ全文に加えて、上部ステータスに短い復旧ヒントを表示する

B) ログ全文だけ表示する

C) 上部ステータスには失敗だけ表示し、詳細はCodex診断に任せる

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問6
U6のテスト範囲はどこまで必須にしますか？

A) command catalog、競合制御、ログ保持、Stop状態、Rendererボタン状態まで単体テストする

B) command catalogと競合制御だけ単体テストし、UIは手動確認にする

C) 最初は手動確認のみで進める

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: b

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式は必須の `[Answer]:` タグ構造に従っている。

## 承認ゲート

すべての質問が回答され、回答内容が検証されるまで、NFR Requirements成果物は生成しない。

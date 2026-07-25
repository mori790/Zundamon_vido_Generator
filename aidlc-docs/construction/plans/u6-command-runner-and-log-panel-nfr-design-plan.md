# NFR Design Plan: U6 コマンド実行とログパネル

## ユニットコンテキスト

- **ユニット**: U6 コマンド実行とログパネル。
- **前段承認**: NFR Requirements承認済み。
- **設計対象**: Electron main processのCommandCatalogとspawn境界、Renderer command client、Operation store、ログリングバッファ、競合制御、Stop制御、復旧ヒント表示。
- **並列化境界**: U6はU3の進行中コード生成を上書きしない。U6は保存済み `input/{videoId}.json` に対するコマンド実行だけを対象にする。

## Step-by-Step NFR Design Plan

### Step 1: 実行境界パターン

- [ ] CommandCatalog固定マッピングパターンを設計する。
- [ ] Rendererから任意シェル文字列を渡さないIPC境界を設計する。
- [ ] npm scripts spawnの引数配列構築を設計する。
- [ ] macOS/Electron環境でのnpm実行失敗時の扱いを設計する。

### Step 2: Operation状態管理パターン

- [ ] Operation lifecycle state machineを設計する。
- [ ] 事前Validateと本コマンドの親子または段階表現を設計する。
- [ ] 200ms以内の状態反映を満たすRenderer更新パターンを設計する。
- [ ] 再実行可能状態の扱いを設計する。

### Step 3: ログ処理パターン

- [ ] stdout/stderr/systemログイベントの形を設計する。
- [ ] Operationごと最新1,000行のリングバッファを設計する。
- [ ] ログ自動スクロールとUI負荷抑制パターンを設計する。
- [ ] Clear Logsの責務を設計する。

### Step 4: 信頼性とStopパターン

- [ ] Stop要求時の `stopping` 状態遷移を設計する。
- [ ] 10秒猶予後の強制終了タイマーを設計する。
- [ ] Stop後の生成途中ファイル警告を設計する。
- [ ] 起動失敗、終了コード失敗、キャンセルの分類を設計する。

### Step 5: UIと将来連携コンポーネント

- [ ] CommandPanel、StatusBar、LogPanelの論理コンポーネントを設計する。
- [ ] VOICEVOXやRemotion失敗時の復旧ヒント表示を設計する。
- [ ] U4 Codex承認からCommandRequestへ接続する将来境界を設計する。
- [ ] U7 Preview更新判断への将来境界を設計する。

### Step 6: NFR Design成果物の生成

- [ ] `aidlc-docs/construction/u6-command-runner-and-log-panel/nfr-design/nfr-design-patterns.md` を作成する。
- [ ] `aidlc-docs/construction/u6-command-runner-and-log-panel/nfr-design/logical-components.md` を作成する。

## 確認質問

各質問について、`[Answer]:` タグの後ろに選択肢の文字を記入してください。選択肢が意図に合わない場合は最後の「その他」を選び、内容を追記してください。

## 質問1
事前Validateと本コマンドの表示は、どのモデルにしますか？

A) 1つのOperation内に「事前Validate」と「本処理」のフェーズとして表示する

B) Validateを子Operation、本コマンドを親Operationとして分けて表示する

C) 事前Validateのログは本コマンドログに混ぜ、状態だけ区切る

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問2
Stopで強制終了する際、子プロセスツリー全体を終了対象にしますか？

A) はい。npmの子プロセスまで含めて終了を試みる

B) まずnpmプロセスだけを終了し、残プロセス検出は後続改善にする

C) Previewだけプロセスツリー終了を試み、他はnpmプロセス終了にする

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問3
ログ表示のUI負荷抑制はどの方式を優先しますか？

A) ログイベントは即時受信し、Renderer表示更新だけを短時間バッチ化する

B) Main process側でログをバッチ化してRendererに送る

C) 初期実装ではバッチ化せず、1,000行上限だけで進める

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問4
VOICEVOX未起動などの復旧ヒントは、どこで分類しますか？

A) Renderer側でログ内容と終了状態から分類する

B) Main process側でstderrを分類してhint codeを送る

C) 初期実装ではCommandTypeと失敗状態だけで固定ヒントを出す

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## 質問5
U6の論理コンポーネントは、どの程度までshared型として切り出しますか？

A) CommandType、Operation、LogEntry、IPC payloadを `src/studio/shared/` に切り出す

B) Renderer内部型として始め、main processに必要な型だけ重複を許容する

C) まずCommandTypeだけshared化し、OperationとLogEntryは実装側に閉じる

D) その他（`[Answer]:` の後に内容を記入してください）

[Answer]: a

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式は必須の `[Answer]:` タグ構造に従っている。

## 承認ゲート

すべての質問が回答され、回答内容が検証されるまで、NFR Design成果物は生成しない。

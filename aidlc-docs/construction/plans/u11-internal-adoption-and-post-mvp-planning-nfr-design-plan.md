# U11 NFR Design計画

## 対象unit

- **Unit ID**: U11
- **Unit名**: Internal Adoption and Post-MVP Planning
- **対象範囲**: README、内部受入文書、厳格なpreflight command、Post-MVP企画文書、focused tests。

## 計画チェックリスト

- [x] U11 NFR Requirements、Functional Design、Application Designを読み込む。
- [x] NFR Designで扱う設計パターンを整理する。
- [x] ユーザー確認が必要なNFR設計判断を特定する。
- [x] この計画ファイルの全回答を収集する。
- [x] 回答の曖昧さ、矛盾、不足を分析する。
- [x] `nfr-design-patterns.md`を生成する。
- [x] `logical-components.md`を生成する。
- [x] NFR Designの完全性、Markdown構文、拡張ルール準拠を確認する。

## 設計対象の候補

- **失敗封じ込め**: preflightは全gate必須、失敗時は非0、artifact自動生成なし。
- **再実行性**: Workspaceや制作dataを変更せず、修正後に同じcommandを再実行できる。
- **性能表示**: 厳密な秒数SLAではなく、時間がかかるcheck名と進行状況を表示する。
- **秘匿情報保護**: 相対path・短い説明を優先し、token、credential、個人情報、不要な絶対pathを出さない。
- **PBT設計**: 新規pure helperだけを対象に、fast-check、shrinking、seed replayを維持する。

## 確認質問

すべての`[Answer]:`へ選択肢の文字を記入してください。該当しない場合は最後の「その他」を選び、同じ行へ説明を追記してください。

### 質問1
preflightの各gate実行順序はどう設計しますか？

A) 軽いartifact検証を先に行い、失敗したらbuild/test gateへ進まず早期終了する（推奨）

B) すべてのgateを最後まで実行し、失敗をまとめて表示する

C) build/test gateを先に実行し、最後にartifact検証する

X) その他（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### 質問2
長時間gateの進行表示はどの粒度にしますか？

A) check開始、成功、失敗、証跡path、次actionをgate単位で表示する（推奨）

B) 最後にまとめて結果だけ表示する

C) 詳細logをすべてstream表示する

X) その他（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### 質問3
秘匿情報対策の設計はどこまでpreflight側で担いますか？

A) preflight report helperで相対path化・伏せ字化を行い、docsにも同じ方針を書く（推奨）

B) docsで注意喚起するだけで、preflight出力は加工しない

C) pathや環境情報を一切表示しない

X) その他（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### 質問4
logical componentsはどの単位に分けますか？

A) Artifact Evidence Reader、Gate Runner、Report Formatter、Documentation Generator、Post-MVP Spec Writerに分ける（推奨）

B) Acceptance Preflight Component 1つにまとめる

C) README/docsとpreflightを完全に別unitとして分ける

X) その他（`[Answer]: X - ...`の形式で記入）

[Answer]: a

### 質問5
PBT設計パターンはどこまでNFR Designへ含めますか？

A) property名、対象pure helper、generator制約、seed replay、example testとの役割分担まで含める（推奨）

B) fast-checkを使うことだけ記載する

C) PBT設計はCode Generation計画まで延期する

X) その他（`[Answer]: X - ...`の形式で記入）

[Answer]: a

## 検証メモ

- Mermaid図とASCII図は含めない。
- Security、Resiliency、Partial PBT拡張の準拠summaryを成果物へ含める。
- Construction stageの完了メッセージは規定の2択形式で提示する。

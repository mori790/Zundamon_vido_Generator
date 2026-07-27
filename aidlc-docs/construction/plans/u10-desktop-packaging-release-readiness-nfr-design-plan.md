# U10 NFR Design計画

## 実行チェックリスト

- [x] U10 NFR RequirementsとFunctional Designを確認する。
- [x] Resilience、Scalability、Performance、Security、Logical Componentの適用性を評価する。
- [x] NFR Design確認質問を作成する。
- [x] すべての回答を収集する。
- [x] 回答の曖昧さ・矛盾・不足を分析する。
- [x] `nfr-design-patterns.md`を生成する。
- [x] `logical-components.md`を生成する。
- [x] Extension準拠とNFR traceabilityを検証する。

## Category適用性

- **Resilience**: 適用。Workspace、外部依存、package、公証の失敗復旧が必要。
- **Scalability**: Local単一利用者として限定適用。Cloud scalingは適用外だが、file数とartifact容量の上限を扱う。
- **Performance**: 適用。起動、Workspace復元、診断timeout、ZIP容量目標がある。
- **Security**: 適用。path、IPC、credential、署名、公証、supply chainを扱う。
- **Logical Components**: 適用。既存serviceへguard、timeout、release verifierを組み込む。Queue、distributed cache、circuit breakerは不要。

## 確認質問

すべての`[Answer]:`へ選択肢の文字を記入してください。

### 質問1: Resilience pattern

Codex／VOICEVOX診断timeout後の再試行をどうしますか？

A) 自動retryせず、対象機能の利用時または手動再診断で再試行する（推奨）

B) 500ms後に1回だけ自動retryする

C) 最大3回exponential backoffする

D) App全体を再起動するまで再試行しない

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問2: Scalability pattern

Workspaceのfile数増加にどう対応しますか？

A) 必須directoryと操作対象だけを遅延検証し、全tree scanを行わない（推奨）

B) 起動時に全fileをscanしてindexを作る

C) Background index databaseを追加する

D) 1,000 fileを超えるWorkspaceを拒否する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問3: Performance pattern

起動時の依存診断をどう実行しますか？

A) First Run UI表示を待たず、Workspace Ready後にCodexとVOICEVOXを並列診断する（推奨）

B) 両診断完了までUI表示を待つ

C) Codex、VOICEVOXの順に直列実行する

D) 起動時診断を行わない

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問4: Security pattern

公証credentialの優先方式をどうしますか？

A) macOS Keychain profileを優先し、環境変数を代替手段にする（推奨）

B) 環境変数だけを使用する

C) 設定fileへ暗号化保存する

D) 毎回command line引数へ入力する

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

### 質問5: Logical component

Release verificationをどう構成しますか？

A) Node標準libraryの純粋判定moduleと、外部command adapterの2層にする（推奨）

B) 1つの大きなrelease shell scriptにする

C) Electron Main serviceへ統合する

D) 手動checklistだけで行う

E) その他（`[Answer]: E - 説明`の形式で記入する）

[Answer]:a

## 必須成果物

- [x] Failure containment、atomic write、cleanup、rollback pattern
- [x] Lazy validation、parallel diagnosis、timeout pattern
- [x] Path guard、typed IPC、credential provider、release gate pattern
- [x] Logical componentと依存関係
- [x] NFR requirementからdesignへのtraceability

# NFR Requirements Plan: U12-B AIシーン分割エンジン

## ユニットコンテキスト

- **ユニット**: U12-B AIシーン分割エンジン
- **スコープ**: プロンプト生成・Codex IPC送信・レスポンスパース・SegmentationResult返却・SceneDraftへの保存。
- **スコープ外**: Codex接続管理（U2）、シーン調整UI（U12-C）、タブ切り替えアニメーション。

## NFR Requirements チェックリスト

- [x] U12-B Functional Design成果物を読み込む。
- [x] U12-BのNFR判断ポイントを特定する。
- [x] ユーザー回答を収集する。
- [x] 回答の曖昧さ・矛盾・不足を分析する（全A選択、設計判断すべて確定）。
- [x] `nfr-requirements.md` を生成する。
- [x] `tech-stack-decisions.md` を生成する。
- [x] NFR Requirementsの完全性を確認する。

## 確認質問

すべての `[Answer]:` へ選択肢の文字を記入してください。

### 質問1
draftText が Codex の最大プロンプトサイズ（64KB）を超えた場合、どうしますか？

A) シーン分割開始前に renderer 側でサイズチェックし、超過時はエラーメッセージを表示して送信しない（推奨）

B) main process の `codex.send()` が例外を投げるまで送信を試み、例外をエラーとして返す

C) 先頭から 60KB に切り詰めて送信する

X) その他（記入）

[Answer]: a

### 質問2
シーン分割のタイムアウト時間はどうしますか？

A) 120秒（推奨）。長い草案テキストでもCodexが応答できる時間を確保する。

B) 60秒。短くして応答性を優先する。

C) 180秒。大量シーン（50+）に対応する。

X) その他（記入）

[Answer]: a

### 質問3
U12-Bのテストは何を必須にしますか？

A) `buildSegmentationPrompt` と `parseSegmentationResponse` の純粋関数単体テスト（JSONコードブロック抽出・フォールバック・空結果・フィールド欠損のケース）を必須にする（推奨）

B) A に加えて IPC ハンドラの統合テスト（Codex モックを使用）も必須にする

C) テストは A のみ、プロパティベーステストも追加する（ランダムテキスト入力でのパース安全性）

X) その他（記入）

[Answer]: a

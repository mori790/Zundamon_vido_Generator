# NFR Design Plan: U12-B AIシーン分割エンジン

## NFR Design チェックリスト

- [x] U12-B NFR Requirements成果物を読み込む。
- [x] 設計パターンを特定する（Fail-Fast・Promise+タイムアウト・純粋関数抽出・入力境界・リソースクリーンアップ）。
- [x] ユーザー追加質問なし（NFR Requirements回答から全設計判断が確定済み）。
- [x] `nfr-design-patterns.md` を生成する。
- [x] `logical-components.md` を生成する。
- [x] NFR Design の完全性を確認する。

## 設計判断の根拠

| 項目 | NFR Requirements決定 | 設計パターン |
|---|---|---|
| エラー方針 | Fail-Fast（全ケースで即座に返す） | Fail-Fastパターン（Promise内でresolve確定） |
| タイムアウト | 120秒 | Promise + setTimeout/clearTimeout パターン |
| プロンプトサイズ | Renderer側64KBチェック | 入力境界パターン（renderer関数内で早期リジェクト） |
| テスト | 純粋関数単体テストのみ | ロジック抽出パターン（IPC・Electron不要） |
| ドラフト保存失敗 | コンソールログのみ | Fail-Open保存パターン（U12-A継承） |

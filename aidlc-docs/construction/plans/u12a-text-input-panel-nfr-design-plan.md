# NFR Design Plan: U12-A テキスト入力パネル

## NFR Design チェックリスト

- [x] U12-A NFR Requirements成果物を読み込む。
- [x] 設計パターンを特定する（デバウンス・fail-open保存・fail-closed上限・IPC境界）。
- [x] ユーザー追加質問なし（NFR Requirements回答から全設計判断が確定済み）。
- [x] `nfr-design-patterns.md` を生成する。
- [x] `logical-components.md` を生成する。
- [x] NFR Design の完全性を確認する。

## 設計判断の根拠

| 項目 | NFR Requirements回答 | 設計方針 |
|---|---|---|
| テキスト入力レスポンス | A: 即時反映、500msデバウンス非同期保存 | デバウンスパターン（カスタムフック） |
| ドラフト保存失敗 | A: コンソールログのみ、再試行 | Fail-Open保存パターン |
| ファイルサイズ上限 | B: 1MB上限 | Fail-Closed入力検証パターン |
| テストスコープ | A: 純粋ロジックの単体テストのみ | ロジック分離パターン（純粋関数として抽出） |

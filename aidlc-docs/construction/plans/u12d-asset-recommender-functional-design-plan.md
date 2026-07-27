# Functional Design Plan: U12-D 素材割り当て

## 設計質問回答

| # | 質問 | 回答 |
|---|---|---|
| Q1 | シーンあたりの素材数 | A（1シーン1素材） |
| Q2 | 素材選択方法 | A（既存 asset.select() IPC を再利用） |
| Q3 | AI 推薦 | A（手動割り当てのみ） |
| Q4 | 未割り当て許可 | A（未割り当てのまま「次へ」可） |

## 生成成果物チェックリスト

- [x] `domain-entities.md` を生成する。
- [x] `business-logic-model.md` を生成する。
- [x] `component-design.md` を生成する。
- [x] Functional Design の完全性を確認する。

# Functional Design Plan: U12-C シーン調整UI

## 設計質問回答

| # | 質問 | 回答 |
|---|---|---|
| Q1 | シーン並び替え方式 | A（上下ボタン・追加ライブラリ不要） |
| Q2 | tags 編集方式 | A（カンマ区切りテキスト入力） |
| Q3 | シーン追加 | A（末尾に空シーンを挿入） |
| Q4 | 完了後の遷移 | A（SceneDraft 保存 → U12-D placeholder タブへ切り替え） |

## 生成成果物チェックリスト

- [x] `domain-entities.md` を生成する。
- [x] `business-logic-model.md` を生成する。
- [x] `component-design.md` を生成する。
- [x] Functional Design の完全性を確認する。

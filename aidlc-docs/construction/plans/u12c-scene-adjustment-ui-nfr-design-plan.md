# NFR Design Plan: U12-C シーン調整UI

## NFR Requirements → 設計パターン マッピング

| NFR Requirements決定 | 設計パターン |
|---|---|
| Fail-Open保存 | Fail-Open 保存パターン（U12-A/B 継承） |
| ロジック抽出（scene-editing.ts） | ロジック抽出パターン（純粋関数 → Vitest 直接テスト） |
| saving フラグ | 保存中フラグパターン（二重送信防止） |
| aria-label / disabled | アクセシビリティパターン |

## 生成成果物チェックリスト

- [x] `nfr-design-patterns.md` を生成する。
- [x] `logical-components.md` を生成する。
- [x] NFR Design の完全性を確認する。

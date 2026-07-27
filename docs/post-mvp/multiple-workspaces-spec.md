# 複数Workspace管理 仕様

## 目的

複数の制作folderを安全に切り替え、毎回file dialogから探す手間を減らす。

## 対象外

- U11での製品コード実装。
- 複数Workspace同時window。
- cloud sync。
- Workspace contentsの移動・複製。

## User Journey

1. 利用者が最近使ったWorkspace一覧を開く。
2. canonical path、表示名、最終利用日時を確認する。
3. 一つを選択して切り替える。
4. 移動、削除、権限喪失時は再選択または一覧から削除する。

## Data

| Field | Constraint |
|---|---|
| `schemaVersion` | version付き`userData` JSON。 |
| `canonicalPath` | Main processで検証されたpath。 |
| `displayName` | 利用者向け表示名。 |
| `lastUsedAt` | successful activation後に更新。 |

## UI

- First RunとStart screenへ最近使ったWorkspace、追加、名称変更、削除、再検証を追加する。
- 同時にactiveなWorkspaceは一つだけ。
- 未保存draft、実行中command、Codex turnがある場合は明示確認する。

## Service

- PathはMain processでcanonical validationする。
- Rendererへ任意filesystem accessを渡さない。
- 重複canonical pathは一件へ正規化する。
- 一覧削除はWorkspace contentsを削除しない。
- 実行中commandを別Workspaceへ引き継がない。

## PBT

| Property | Entity | Generator制約 | Seed replay |
|---|---|---|---|
| `workspaceReferencesAreCanonicalUnique` | WorkspaceReference list | duplicate canonical paths、display names、timestamps | fast-check seedを失敗時に再実行可能にする。 |

## 受入条件

- 無効参照はfail closedで、別pathへfallbackしない。
- Workspace切替後、Script、Codex、Preview、Renderは新しいrootだけを使う。
- 一覧削除後もWorkspace contentsは残る。

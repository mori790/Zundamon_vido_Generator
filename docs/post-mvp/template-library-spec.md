# テンプレートライブラリ 仕様

## 目的

繰り返し使うvideo設定とscene構成を安全に再利用し、新規台本作成時間を短縮する。

## 対象外

- U11での製品コード実装。
- Online marketplace。
- 外部template download。
- remote code/plugin実行。

## User Journey

1. 利用者がbuilt-inまたはWorkspace templateを選ぶ。
2. title、video ID、placeholderを入力する。
3. draft previewを確認する。
4. 新しいdraftとして作成し、既存U3 Applyで保存する。

## Data

| Field | Constraint |
|---|---|
| `schemaVersion` | supported versionのみ。 |
| `templateId` | built-inまたはWorkspace template内で一意。 |
| `name` | 必須。 |
| `description` | bounded length。 |
| `scriptSkeleton` | placeholder適用後にVideoScript schemaへ合格する。 |
| `placeholders` | key一意、type、required、constraintsを持つ。 |
| `requiredAssets` | 参照のみ。binaryを埋め込まない。 |

## UI

- Template選択、説明、必要入力、draft preview、Apply取消を提供する。
- Built-in templateはread-only。
- Workspace templateは作成、編集、削除できる。

## Service

- Template適用はactive scriptを直接上書きせず、常にdraftを作る。
- Placeholder未入力、型不一致、未知field、対応外schema versionを拒否する。
- 失敗時はactive scriptと既存draftを変更しない。

## PBT

| Property | Entity | Generator制約 | Seed replay |
|---|---|---|---|
| `templateRoundTripPreservesMeaning` | TemplateMetadata | supported schema version、bounded skeleton、typed placeholders | fast-check seedを失敗時に再実行可能にする。 |
| `templateDraftIsSchemaValid` | Generated Draft | placeholder constraintsを満たす入力 | shrink後の最小反例をexample regressionへ残す。 |

## 受入条件

- Templateから作成したdraftは既存VideoScript schemaで検証される。
- Template失敗時にactive scriptと既存draftを変更しない。
- Asset binaryをtemplateへ埋め込まない。

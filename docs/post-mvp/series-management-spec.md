# シリーズ管理 仕様

## 目的

複数のvideo IDを一つのシリーズとして整理し、順序、共通metadata、制作状態を把握する。

## 対象外

- U11での製品コード実装。
- YouTube playlist同期。
- 共同編集。
- episode一括Render。

## User Journey

1. 利用者がシリーズを作成する。
2. 既存video IDを追加または新規videoを作る。
3. episode順を変更し、制作状態を確認する。
4. videoを既存single-video workflowで開く。

## Data

| Field | Constraint |
|---|---|
| `schemaVersion` | version付きJSON。 |
| `seriesId` | Workspace内で一意。 |
| `title` | 必須。 |
| `description` | 任意、bounded length。 |
| `orderedVideoIds` | 0から100件、既存video ID、一意、順序保持。 |
| `status` | planned、active、complete、archived。 |

## UI

- Start screenにシリーズ一覧、作成、名称変更、video追加、並べ替え、開くを追加する。
- 並べ替えは明示保存までcanonical dataへ反映しない。
- シリーズ削除はvideo script、asset、audio、outputを削除しない。

## Service

- Main processがWorkspace内metadataをatomic保存する。
- Rendererにはpurpose-specific typed APIだけを公開する。
- invalid dataでは既存fileを維持する。

## PBT

| Property | Entity | Generator制約 | Seed replay |
|---|---|---|---|
| `seriesRoundTripPreservesOrder` | SeriesMetadata | 0から100件のunique video IDs、status enum | fast-check seedを失敗時に再実行可能にする。 |
| `seriesVideoIdsRemainUnique` | SeriesMetadata | duplicateを含むvideo ID list、missing ID候補 | shrink後の最小反例をexample regressionへ残す。 |

## 受入条件

- 100 episodesまで通常操作が滑らかである。
- 存在しないvideo IDと重複IDは拒否される。
- シリーズ削除後も全videoを単独で開ける。

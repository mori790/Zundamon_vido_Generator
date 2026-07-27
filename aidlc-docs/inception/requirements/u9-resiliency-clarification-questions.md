# U9 Resiliency Clarification Questions

Resiliency Baselineを有効化したため、以下はユーザー判断が必要です。回答する選択肢の文字を各 `[Answer]:` の後へ記入してください。

## Question 1
U9 local desktop applicationのRTO、RPO、Disaster Recovery方針はどれですか？

A) N/A - local personal toolでありcross-region DRは不要。Workspace filesとCodex thread IDは通常のローカルbackupへ委ねる（推奨）

B) RPO/RTOはhours。Backup and Restore手順をU9に含める

C) RPO/RTOはtens of minutes。Pilot Light相当の復旧方針を設計する

D) RPO/RTOはminutes以下。Warm Standby以上の復旧方針を設計する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 2
U9のchange managementはどれですか？

A) N/A - local personal toolとしてformal processを免除し、Git履歴とAI-DLC approval gateを変更記録にする（推奨）

B) 軽量processとしてchange record、approval、rollback noteを追加する

C) 既存組織processを使用する（process名を追記）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 3
CI/CD toolingはどれですか？

A) U9ではCI/CD deploymentを追加せず、既存local npm build/test手順を使用する（推奨）

B) GitHub Actions pipelineをU9に追加する

C) 既存CI/CD pipelineを使用する（tool名を追記）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 4
失敗したU9 releaseのrollback方式はどれですか？

A) Gitのprevious known-good revisionとlockfileを使用してlocal buildを戻す（推奨）

B) packaged artifactのprevious versionを再installする

C) 既存組織rollback procedureを使用する（referenceを追記）

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 5
U9のdeployment styleはどれですか？

A) Direct local update。起動前のbuild/test成功を必須にする（推奨）

B) Versioned packaged applicationをside-by-sideで配置する

C) U10 packagingまでdeployment判断を延期する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 6
Regional topologyはどれですか？

A) N/A - local macOS processだけを対象とし、cloud regionやavailability zoneを使用しない（推奨）

B) 将来のremote App Serverを想定し、single-region multi-zone要件を含める

C) Multi-region要件を含める

X) Other (please describe after [Answer]: tag below)

[Answer]:a

## Question 7
Incident responseとCorrection of Errorsはどれですか？

A) Formal processなし。Local logs、再現手順、GitHub issue相当の記録、修正後のregression testを軽量processとして採用する（推奨）

B) 既存組織incident response processを使用する（referenceを追記）

C) U10 release readinessまで延期する

X) Other (please describe after [Answer]: tag below)

[Answer]:a

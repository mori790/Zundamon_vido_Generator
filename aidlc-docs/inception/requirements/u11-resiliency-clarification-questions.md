# U11 Resiliency追加確認

各質問の`[Answer]:`へ選択肢の英字を記入してください。

## Question 1
身内向けローカルアプリとWorkspaceのRTO／RPOをどの水準にしますか？

A) RTOは数時間、RPOは直近の手動backup時点。Backup & Restoreを基本とする（推奨）

B) RTOは数十分、RPOは1時間以内。別diskへの定期backupを前提とする

C) RTO／RPOを定めず、利用者自身のbackupへ完全に委ねる

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 2
U11以降の変更管理をどの方式にしますか？

A) Git commit、AI-DLC audit、変更概要、承認、Rollback noteからなる軽量processを採用する（推奨）

B) 既存の組織内変更管理processを使う（`[Answer]:`へ名称を追記）

C) 身内向け試用のためformalな変更管理を免除する

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 3
Buildと配布の実行方式はどれにしますか？

A) 現行どおり開発Macのlocal npm commandを使い、checklistで検証する（推奨）

B) GitHub ActionsなどのCI pipelineをU11で企画対象に加える

C) 既存のCI/CD pipelineを使う（`[Answer]:`へ名称を追記）

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 4
問題が発生したversionのRollback方式はどれにしますか？

A) 直前の既知正常ZIP／`.app`へ置き換え、Workspaceはそのまま維持する（推奨）

B) 新旧versionを別名で保持し、利用者が起動対象を切り替える

C) 既存のRollback手順を使う（`[Answer]:`へ参照を追記）

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 5
身内向け配布のdeployment styleはどれにしますか？

A) 利用者ごとのdirect／in-place置換（推奨）

B) 一部利用者だけへ先行配布するcanary方式

C) 新旧アプリを並行配置して切り替えるblue／green相当

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 6
障害対応と再発防止をどの方式にしますか？

A) IssueまたはMarkdownへ症状、影響、回避策、原因、修正、再発防止を残す軽量processを採用する（推奨）

B) 既存のincident response processを使う（`[Answer]:`へ名称を追記）

C) 記録せず都度対応する

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 7
将来の配置topologyをどう扱いますか？

A) ローカルmacOSアプリを維持し、cloud／multi-regionは対象外とする（推奨）

B) 将来のcloud同期を企画候補に追加するが、U11詳細仕様の上位3件には含めない

C) Cloud共有を上位3件の詳細仕様へ含める

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

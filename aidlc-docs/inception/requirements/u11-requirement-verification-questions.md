# U11 要件確認質問

各質問の`[Answer]:`へ選択肢の英字を記入してください。該当しない場合は最後の「その他」を選び、同じ行へ内容を追記してください。

## Question 1
U11で実際にコード・文書を変更する範囲はどこまでにしますか？

A) README更新と身内向け受入支援だけを実装し、MVP対象外機能は企画・要件・仕様文書までにする（推奨）

B) README更新と受入支援に加え、優先度1位の将来機能も実装する

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 2
READMEの主な読者と構成はどれにしますか？

A) 身内の非開発者を主読者とし、Desktop GUIを先頭、CLIと開発手順を後半に置く（推奨）

B) 開発者を主読者とし、CLI中心を維持してDesktop GUIを追加する

C) 利用者向けREADMEと開発者向け文書を別ファイルへ分ける

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 3
身内へのlocal-acceptance ZIP配布方法はどれを前提にしますか？

A) 開発者がZIPとSHA-256を直接渡し、受領者が手順書に従う（推奨）

B) Private GitHub Releaseなど認証済みの限定共有場所を使う

C) 同じMac上の別ユーザーだけで試験し、外部Macへはまだ配布しない

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 4
新規Macユーザー受入テストを実行できる環境はありますか？

A) 別のApple Silicon Macまたは新規macOSユーザープロファイルがあり、利用者がchecklistを実行できる

B) 同じMacの新規ユーザープロファイルで開発者が実行する

C) 現時点では環境がなく、U11では自動化可能部分と実行用checklistの整備までにする

X) その他（`[Answer]:`の後へ記述）

[Answer]: c

## Question 5
身内向け受入の合格基準はどこまでにしますか？

A) First Run、Workspace復元、Codex／VOICEVOX診断、台本編集、素材、Preview、Render、Stop、Finder表示まで（推奨）

B) Aに加え、手動更新と旧versionへのRollbackまで

C) 起動、Workspace、sample-video Renderの最小smokeだけ

X) その他（`[Answer]:`の後へ記述）

[Answer]: c

## Question 6
受入結果をどの形式で保存しますか？

A) 実行日時、Mac／macOS、app version、各項目のPass／Fail、証跡pathをMarkdownへ記録する（推奨）

B) Checklistのチェック状態だけをMarkdownへ記録する

C) 記録を残さず口頭確認とする

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 7
MVP対象外機能の企画対象をどこまで広げますか？

A) 現在判明している全候補を一覧化・優先順位付けし、上位3件だけ詳細仕様を決める（推奨）

B) 全候補について同じ深さで詳細仕様を決める

C) 直近に実装する1件だけ企画・要件・仕様を決める

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 8
将来機能で最優先する価値はどれですか？

A) 制作効率：シリーズ管理、テンプレート、複数Workspace

B) 公開効率：サムネイル生成、YouTubeアップロード

C) 配布運用：Auto Update、DMG／PKG、Universal Binary

D) 大規模制作：Render queue、ログ永続化、Preview自動更新

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 9
将来機能の仕様書に必要な深さはどれですか？

A) 目的、persona、user journey、機能要件、NFR、data、UI、受入条件、依存関係、対象外まで実装判断可能にする（推奨）

B) 目的、主要要件、受入条件までのproduct specificationにする

C) Idea backlogと概算優先順位だけにする

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 10
将来機能のロードマップはどの期間で整理しますか？

A) Next／Later／Futureの3段階で、日付を固定しない（推奨）

B) 3か月／6か月／12か月で整理する

C) 優先順位だけを決め、期間区分を設けない

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 11
Security BaselineをU11へ適用しますか？

A) はい。適用可能なSECURITY規則をblocking constraintとして維持する（推奨）

B) いいえ。身内向け試用と企画文書の速度を優先する

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 12
Resiliency BaselineをU11へ適用しますか？

A) はい。身内向け受入、更新、Rollback、将来機能の復旧設計へ適用する（推奨）

B) いいえ。今回は文書と手動確認を優先する

X) その他（`[Answer]:`の後へ記述）

[Answer]: a

## Question 13
Property-Based Testing規則をU11へ適用しますか？

A) Full。新しいbusiness logic、状態、serialize／parseへ完全適用する

B) Partial。pure functionとserialize／parseだけへ適用する（推奨）

C) 適用しない。README、checklist、企画文書を中心とする

X) その他（`[Answer]:`の後へ記述）

[Answer]: b

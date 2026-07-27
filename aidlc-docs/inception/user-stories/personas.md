# U11 ペルソナ

## P1: 身内の非開発利用者

- **役割**: Apple Silicon Macで配布ZIPを受け取り、Desktop GUIからずんだもん動画を試用する身内の利用者
- **利用環境**: macOS 13以降、受け取った`local-acceptance` ZIP、空のWorkspace folder、必要に応じたVOICEVOX Engine
- **目標**:
  - Terminal操作を前提にせず、READMEだけで導入と最小smokeへ進む
  - ZIPとSHA-256を照合し、未署名artifactの扱いを理解する
  - アプリ起動、Workspace選択、sample-video Renderを確認する
  - 問題時に開発者へ渡す証跡を安全に残す
- **制約**:
  - Gatekeeper、署名、公証、VOICEVOX、Workspaceの概念に詳しくない
  - Token、credential、個人情報、不要な絶対pathを報告へ含めてはいけない
  - 新規Macまたは新規macOS user profileでの受入環境はU11時点では未実行
- **成功条件**:
  - READMEのDesktop-first手順で最小smokeを迷わず実行できる
  - 失敗時にPass／Fail／Blocked／Not Runと証跡pathをMarkdownへ記録できる

## P2: 開発・リリース担当者

- **役割**: ローカルMacでbuild、local-acceptance artifact作成、preflight、身内向け配布判断、受入支援を行う開発者
- **利用環境**: FileVault推奨のApple Silicon Mac、npm lockfile、Electron Forge artifact、release manifest、SBOM、SHA-256
- **目標**:
  - 未署名成果物を一般配布可能と誤認させない
  - 1つのnpm commandでartifact、manifest、SBOM、audit、typecheck、tests、Studio buildを非破壊に確認する
  - 失敗時に日本語のactionと証跡pathを提示する
  - U11後に実機受入を再現できるchecklistとtemplateを渡す
- **制約**:
  - Apple署名・公証は資格情報がない限り成功扱いにしない
  - 既存Workspace、input、asset、outputをpreflightで変更してはいけない
  - 変更管理はGit commit、AI-DLC audit、変更概要、承認、Rollback noteで追跡する
- **成功条件**:
  - `local-acceptance`と`publishable`の境界がfail closedで守られる
  - 身内利用者からの受入結果を安全に比較・再試験できる

## P3: 将来の継続利用者

- **役割**: MVP後にシリーズ、テンプレート、複数Workspaceを使って継続的に動画制作する利用者
- **利用環境**: 複数のvideo ID、複数の制作folder、再利用したいscript構成、既存single-video workflow
- **目標**:
  - シリーズ単位でvideo IDの順序、metadata、制作状態を把握する
  - テンプレートから安全に新しいdraftを作り、制作時間を短縮する
  - 最近使ったWorkspaceを安全に切り替える
  - 既存single-video workflowと既存Workspace contentsを壊さず使い続ける
- **制約**:
  - U11では将来機能を実装せず、Next／Later／Futureの企画・仕様までに留める
  - Cloud共有、共同編集、完全自動実行はHuman Approval境界やローカル方針と衝突するためFuture扱い
  - 将来dataはruntime schema、bounded input、atomic保存、fail-closed validationが必要
- **成功条件**:
  - Next上位3件の価値、依存、risk、受入条件が比較できる
  - 実装時にserialize／parse round-trip、unique invariant、schema-valid invariantをPartial PBTへ接続できる

## 対応範囲

| ペルソナ | 対応ストーリー |
|---|---|
| P1 身内の非開発利用者 | US-1, US-2, US-3, US-4 |
| P2 開発・リリース担当者 | US-2, US-3, US-4, US-5, US-6 |
| P3 将来の継続利用者 | US-7, US-8, US-9, US-10, US-11 |

## Extension準拠

| Extension | 状態 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | ZIP checksum、未署名artifact警告、secret／PII非記録、purpose-specific IPC、schema validationをpersona制約へ反映した。 |
| Resiliency Baseline | Compliant | RTO数時間、RPO直近manual backup、Rollback、incident記録、local direct deploymentをpersona制約へ反映した。 |
| Property-Based Testing (Partial) | Compliant | 将来dataのround-trip、schema-valid、unique invariantをP3成功条件へ反映した。 |

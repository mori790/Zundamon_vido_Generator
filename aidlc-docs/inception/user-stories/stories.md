# U11 ユーザーストーリー

## 記載方針

- **整理方法**: 内部受入ジャーニーとPost-MVP機能エピック
- **粒度**: 1つの利用者成果と受入確認で完結する単位
- **受入条件**: 正常系と主要な失敗系をGiven／When／Then形式で記載
- **優先度**: Must／Should／CouldとNext／Later／Futureを併記
- **実装境界**: U11で実装するのはREADME更新と身内向け受入支援。Post-MVP機能は仕様文書までで、製品コードへ実装しない。

## 内部受入ジャーニー

### US-1: Desktop-first READMEから導入を開始する

**優先度**: Must / Next  
**ペルソナ**: P1  
**要件対応**: U11-FR-1, U11-NFR-1, U11-NFR-3

身内の非開発利用者として、READMEの冒頭からDesktop GUIの導入手順を読みたい。そうすることで、CLIや開発環境の知識なしに試用開始まで進められる。

**受入条件**

- Given READMEを開く、When 冒頭を読む、Then 製品目的、対応Mac、`local-acceptance`の意味、一般配布禁止が日本語で分かる。
- Given Desktop利用者が導入手順を読む、When First Run、Workspace、Codex、VOICEVOX、sample-video smokeを確認する、Then 手順がその順番で案内される。
- Given CLI利用者または開発者がREADMEを読む、When 後半へ進む、Then 既存CLI、test、release commandの情報が削除されず分離されている。
- Given 通常の導入手順を読む、When Gatekeeper関連の説明を確認する、Then Gatekeeper無効化やquarantine属性削除は通常手順として案内されない。

### US-2: ZIPとSHA-256を照合して試用する

**優先度**: Must / Next  
**ペルソナ**: P1, P2  
**要件対応**: U11-FR-1, U11-FR-2, U11-NFR-1

身内の非開発利用者として、開発者から受け取ったZIPとSHA-256を照合したい。そうすることで、改ざんや取り違えを避けて`local-acceptance` artifactを試用できる。

**受入条件**

- Given 開発者がZIPとSHA-256を渡す、When 利用者がREADMEの照合手順を実行する、Then ZIPのhashが一致するか確認できる。
- Given hashが一致する、When 利用者がアプリを展開する、Then 未署名`local-acceptance`であり一般公開用ではないことを理解できる。
- Given hashが不一致である、When 利用者が手順を読む、Then 起動せず開発者へ再送付を依頼するactionが分かる。

### US-3: Clean-profile smoke checklistを実行する

**優先度**: Must / Next  
**ペルソナ**: P1, P2  
**要件対応**: U11-FR-3, U11-FR-4, U11-NFR-2, U11-NFR-3

身内の非開発利用者として、新規Macまたは新規macOS user profileで最小smokeを実行したい。そうすることで、起動、Workspace、sample-video Renderだけを合格基準として判断できる。

**受入条件**

- Given checklistを開く、When 必須smokeを確認する、Then ZIP照合、アプリ起動、空Workspace選択、sample-video、Render、non-zero MP4確認に限定されている。
- Given VOICEVOXを用意できる、When Renderを実行する、Then 通常音声生成込みでsample-videoのMP4を確認できる。
- Given VOICEVOXを用意できない、When checklistを読む、Then 既存音声または`--skip-voice`相当の開発者支援手順でRender確認へ進める。
- Given Codex、診断、編集、素材、Stop、Finder reveal、更新、Rollbackを確認する、When checklistを読む、Then それらは追加確認項目であり最小合格を妨げない。
- Given U11内で実機環境がない、When checklistを保存する、Then 結果は未実行と明記され、合格済みとは記録されない。

### US-4: 受入証跡を安全に記録する

**優先度**: Must / Next  
**ペルソナ**: P1, P2  
**要件対応**: U11-FR-4, U11-NFR-1, U11-NFR-2

開発・リリース担当者として、受入結果をMarkdown templateで回収したい。そうすることで、失敗時の再試験と原因調査を安全に行える。

**受入条件**

- Given 受入templateを開く、When 実行結果を記録する、Then 実行日時、実行者、Mac model、CPU architecture、macOS version、app version、Git revision、ZIP名、SHA-256を書ける。
- Given 各stepを確認する、When 結果を記入する、Then Pass／Fail／Blocked／Not Runと証跡pathを記録できる。
- Given failureが起きる、When templateへ追記する、Then failure概要、回避策、再試験結果を残せる。
- Given screenshot、log、MP4を添付する、When templateの注意を読む、Then credential、token、個人情報、不要な絶対pathを記録しないことが分かる。

### US-5: 内部受入preflightを非破壊に実行する

**優先度**: Must / Next  
**ペルソナ**: P2  
**要件対応**: U11-FR-2, U11-NFR-1, U11-NFR-2

開発・リリース担当者として、repositoryから1つのnpm commandで内部受入前の状態を確認したい。そうすることで、身内へ渡す前にartifactと環境の問題を検出できる。

**受入条件**

- Given repositoryにlocal-acceptance artifactがある、When preflight commandを実行する、Then arm64 ZIP、release manifest、SBOMの存在を確認する。
- Given manifestとZIPがある、When preflightがchecksumを検証する、Then ZIPのSHA-256とmanifestが一致することを確認する。
- Given release stateを検証する、When artifactが未署名local-acceptanceである、Then `publishable`とは表示せず、Apple署名・公証を成功扱いにしない。
- Given preflightが実行される、When audit、typecheck、default tests、Studio buildを確認する、Then 結果と証跡pathが日本語で表示される。
- Given preflightが失敗する、When commandが終了する、Then 非0で終了し、既存Workspace、input、asset、outputを変更しない。

### US-6: Post-MVP候補をRoadmapで比較する

**優先度**: Must / Next  
**ペルソナ**: P2, P3  
**要件対応**: U11-FR-5, U11-FR-6, U11-NFR-2

開発・リリース担当者として、MVP対象外機能をNext／Later／Futureで比較したい。そうすることで、次の実装判断を価値、依存、risk、規模、exit criteriaで行える。

**受入条件**

- Given Post-MVP backlogを読む、When 候補一覧を確認する、Then シリーズ管理、テンプレート、複数Workspace、サムネイル、YouTube、Auto Update、DMG／PKG、Universal Binary、Render queue、ログ永続化、Preview watcher、Cloud共有、代替AI provider、Codex完全自動実行が重複なく記録されている。
- Given Roadmapを読む、When Next区分を確認する、Then シリーズ管理、テンプレートライブラリ、複数Workspace管理が上位3件として示される。
- Given Future区分を読む、When 完全自動実行とCloud共有を確認する、Then Human Approval境界とローカル方針のriskが明記されている。
- Given Roadmap項目を移動したい、When 変更判断を行う、Then 日付や工数確約ではなく、要件、risk、価値、承認で再評価する。

## Post-MVP機能エピック

### US-7: シリーズを作成してvideo IDを整理する

**優先度**: Must / Next  
**ペルソナ**: P3  
**要件対応**: NEXT-1, U11-FR-5, U11-FR-6

将来の継続利用者として、複数のvideo IDをシリーズとして整理したい。そうすることで、順序、共通metadata、制作状態を把握できる。

**受入条件**

- Given 利用者がシリーズを作成する、When Series ID、title、description、ordered video IDs、statusを保存する、Then Workspace内のversion付きJSONとしてatomicに保存される。
- Given 既存`input/{videoId}.json`がある、When シリーズへ追加する、Then script fileを移動・複製せず参照だけを保存する。
- Given 存在しないvideo ID、重複ID、同一シリーズ内重複がある、When 保存する、Then invalid dataとして拒否し既存fileを維持する。
- Given episode順を変更する、When 明示保存前に画面を閉じる、Then canonical dataへ反映されない。
- Given シリーズを削除する、When 削除を確定する、Then video script、asset、audio、outputは削除されず単独で開ける。
- Given 100 episodesまでのシリーズがある、When 一覧、並べ替え、開くを操作する、Then 通常操作が滑らかである。

### US-8: テンプレートから新しいdraftを作成する

**優先度**: Must / Next  
**ペルソナ**: P3  
**要件対応**: NEXT-2, U11-FR-5, U11-FR-6

将来の継続利用者として、built-inまたはWorkspace templateから新しい台本draftを作りたい。そうすることで、繰り返し使う構成を安全に再利用できる。

**受入条件**

- Given template libraryを開く、When templateを選ぶ、Then Template ID、name、description、schema version、script skeleton、placeholder定義を確認できる。
- Given title、video ID、placeholderを入力する、When draft previewを生成する、Then active scriptを直接上書きせず新しいdraftだけを作る。
- Given placeholder未入力、型不一致、未知field、対応外schema versionがある、When templateを適用する、Then active scriptと既存draftを変更せず拒否する。
- Given templateからdraftを作る、When 検証する、Then 既存VideoScript schemaに合格する。
- Given Workspace templateを保存する、When serialize／parseする、Then round-tripで意味が維持される。
- Given templateにassetが必要である、When templateを保存する、Then binaryを埋め込まず必要assetを明示する。

### US-9: 複数Workspaceを安全に切り替える

**優先度**: Must / Next  
**ペルソナ**: P3  
**要件対応**: NEXT-3, U11-FR-5, U11-FR-6

将来の継続利用者として、最近使ったWorkspaceを一覧から切り替えたい。そうすることで、複数の制作folderを毎回file dialogから探さず安全に扱える。

**受入条件**

- Given 最近使ったWorkspace一覧を開く、When 参照を確認する、Then canonical path、表示名、最終利用日時だけが表示される。
- Given Workspaceを追加する、When Main processでcanonical validationを行う、Then Rendererへ任意filesystem accessを与えず保存する。
- Given 同じcanonical pathを追加する、When reference listを保存する、Then 重複は一件へ正規化される。
- Given 未保存draft、実行中command、Codex turnがある、When Workspaceを切り替える、Then 明示確認なしに切替を進めない。
- Given 実行中commandがある、When 切替後のWorkspaceを開く、Then commandを別Workspaceへ引き継がない。
- Given 一覧からWorkspace参照を削除する、When 削除を確定する、Then Workspace contentsは削除されない。
- Given Workspaceが移動、削除、権限喪失している、When 再検証する、Then 別pathへfallbackせずfail closedで再選択または一覧削除を案内する。

### US-10: Later候補を詳細化前のbacklogとして保持する

**優先度**: Should / Later  
**ペルソナ**: P2, P3  
**要件対応**: U11-FR-5, U11-FR-6

開発・リリース担当者として、Later候補を詳細化前のbacklogとして保持したい。そうすることで、Next完了後に公開効率や大規模制作の価値を再評価できる。

**受入条件**

- Given Later backlogを読む、When 候補を確認する、Then サムネイル自動生成、YouTubeアップロード、Render queue、ログ永続化、Preview filesystem watcherが記録されている。
- Given Later候補をNextへ移す、When 再評価する、Then 利用者価値、依存、risk、概算規模、exit criteriaを更新して承認を得る。
- Given YouTubeやfilesystem watcherを検討する、When riskを確認する、Then credential、外部API、監視負荷、failure containmentが未解決のまま実装に進まない。

### US-11: Future候補を境界条件つきで保持する

**優先度**: Could / Future  
**ペルソナ**: P2, P3  
**要件対応**: U11-FR-5, U11-FR-6, U11-NFR-1, U11-NFR-2

開発・リリース担当者として、Future候補を境界条件つきで残したい。そうすることで、ローカル方針やHuman Approval境界を崩す機能を時期尚早に実装しない。

**受入条件**

- Given Future backlogを読む、When 候補を確認する、Then Auto Update、DMG／PKG、Universal Binary、Cloud共有／複数ユーザー、API-key型の代替AI provider、Codex完全自動実行が記録されている。
- Given 完全自動実行を検討する、When 仕様化する、Then Human Approval境界を弱めるriskと必要な承認条件が明記される。
- Given Cloud共有、複数ユーザー、認証、中央監視を検討する、When 仕様化する、Then ローカルmacOSアプリ方針との差分とSecurity／Resiliency再評価が必要と分かる。
- Given Auto UpdateやDMG／PKGを検討する、When 配布方式を変更する、Then 署名、公証、rollback、artifact integrity、利用者ごとのdirect／in-place方針との差分を再設計する。

## 要件・ペルソナ・ストーリー対応

| 要件 | 対応ストーリー | 主ペルソナ |
|---|---|---|
| U11-FR-1 Desktop-first README | US-1, US-2 | P1, P2 |
| U11-FR-2 Internal Acceptance Preflight | US-5 | P2 |
| U11-FR-3 Clean-profile Smoke Checklist | US-3 | P1, P2 |
| U11-FR-4 Acceptance Evidence Template | US-4 | P1, P2 |
| U11-FR-5 Post-MVP Backlog | US-6, US-10, US-11 | P2, P3 |
| U11-FR-6 Roadmap | US-6, US-10, US-11 | P2, P3 |
| NEXT-1 シリーズ管理 | US-7 | P3 |
| NEXT-2 テンプレートライブラリ | US-8 | P3 |
| NEXT-3 複数Workspace管理 | US-9 | P3 |
| U11-NFR-1 Security | US-1, US-2, US-4, US-5, US-8, US-9, US-11 | P1, P2, P3 |
| U11-NFR-2 Resiliency | US-3, US-4, US-5, US-6, US-7, US-9, US-11 | P1, P2, P3 |
| U11-NFR-3 Usability／Accessibility | US-1, US-3, US-4 | P1, P2 |

## INVEST確認

| 基準 | 判定 | 根拠 |
|---|---|---|
| Independent | Compliant | 各storyはREADME、checksum、smoke、evidence、preflight、Roadmap、Next機能ごとの成果へ分けた。 |
| Negotiable | Compliant | 安全境界とU11実装境界以外は実装方式を固定していない。 |
| Valuable | Compliant | 各storyはP1、P2、P3の導入、受入、制作効率、将来判断へ直接価値を持つ。 |
| Estimable | Compliant | 要件ID、persona、受入条件、対象外境界を持つ。 |
| Small | Compliant | Next上位3件以外はbacklog storyに留め、過剰な細分化を避けた。 |
| Testable | Compliant | すべてGiven／When／Then形式の受入条件を持つ。 |

## Extension準拠

| Extension | 状態 | 根拠 |
|---|---|---|
| Security Baseline | Compliant | SECURITY-10とSECURITY-13をchecksum、SBOM、manifest、artifact integrityへ反映し、SECURITY-05とSECURITY-08相当をschema validation、purpose-specific IPC、Renderer filesystem制限へ反映した。Cloud、public API、authentication、network intermediary規則はU11 user-story stageではN/A。blocking findingなし。 |
| Resiliency Baseline | Compliant | RESILIENCY-01からRESILIENCY-04、RESILIENCY-15相当をLow criticality、RTO数時間、RPO直近manual backup、Git／AI-DLC audit、direct／in-place、Rollback、incident Markdownへ反映した。Cloud HA、multi-region、central monitoring規則はローカルmacOS artifactのためN/A。blocking findingなし。 |
| Property-Based Testing (Partial) | Compliant | PBT-02、PBT-03、PBT-07、PBT-08、PBT-09の対象としてseries metadata、template、Workspace reference listのround-trip、unique、schema-valid、seed再現を受入条件へ接続した。blocking findingなし。 |

# U11 身内向け導入準備・Post-MVP企画 要件

## 意図分析

- **ユーザー要求**: 身内で利用できるようREADMEと新規Macユーザー受入支援を整備し、MVP対象外機能の企画、要件、仕様を決定する。
- **要求種別**: 既存製品の導入性改善、受入支援、次期product planning。
- **対象範囲**: README、local-acceptance配布手順、最小smoke受入、証跡template、将来機能backlog、上位3件の詳細仕様。
- **複雑度**: Comprehensive。実装変更自体は小さいが、利用者向け安全案内、復旧、複数の将来機能と優先順位を扱う。
- **U11実装境界**: README更新と受入支援のみを実装する。将来機能は文書化までとし、製品コードへ実装しない。

## 確定した判断

- READMEは身内の非開発者を主読者とし、Desktop GUIを先頭、CLI／開発手順を後半に置く。
- 開発者がlocal-acceptance ZIPとSHA-256を利用者へ直接渡す。
- 別Mac／新規ユーザープロファイルは現時点で利用できないため、U11では自動preflightと実行用checklistを完成させる。
- 身内向け受入は「起動、Workspace、sample-video Render」の最小smokeを合格基準とする。
- 受入結果は日時、Mac、macOS、app version、Pass／Fail、証跡pathをMarkdownへ記録する。
- 将来機能は全候補を順位付けし、上位3件だけ実装判断可能な詳細仕様を作る。
- 最優先価値は制作効率とする。
- Roadmapは日付を固定せず、Next／Later／Futureで管理する。
- SecurityとResiliencyはblocking constraint、PBTはPartialを適用する。

## 利用者とBusiness Goal

### P1: 身内の動画制作者

- Terminal操作を前提とせず、受け取ったZIPからsample動画を生成できる。
- 問題時に安全な復旧方法と開発者へ渡す証跡が分かる。

### P2: 開発・配布担当者

- 未署名artifactを一般配布用と誤認させず、再現可能な手順と証跡を渡せる。
- 次に実装する機能の価値、依存、受入条件を比較できる。

### 成功条件

- 非開発者がREADMEだけから前提条件、導入、First Run、最小smoke、問題報告へ到達できる。
- 自動preflightがartifactと環境の確認結果を非破壊で出力する。
- 実機受入を後日実行できる記録templateがある。
- Post-MVP候補の優先順位と上位3件の詳細仕様が承認可能な状態になる。

## U11機能要件

### U11-FR-1: Desktop-first README

- README冒頭で製品目的、対応Mac、`local-acceptance`の意味、一般配布禁止を説明する。
- GUIの導入、First Run、Workspace、Codex、VOICEVOX、sample-video smokeを順番に説明する。
- ZIPとSHA-256の受渡し・照合方法を記載する。
- Gatekeeper無効化やquarantine属性削除を通常手順として案内しない。
- GUI利用者向けTroubleshootingの後にCLI／開発／test／release commandを分離して記載する。
- 既存CLI互換性を維持し、CLI利用者向け情報を削除しない。

### U11-FR-2: Internal Acceptance Preflight

- repositoryから実行する1つのnpm commandを提供する。
- preflightは次を確認する。
  - arm64 ZIP、release manifest、SBOMの存在。
  - ZIPのSHA-256とmanifestの一致。
  - architectureがarm64であること。
  - release stateが`local-acceptance`であり、`publishable`と表示しないこと。
  - production dependency audit、typecheck、default tests、Studio buildの実行結果。
- Apple署名・公証を成功と偽装せず、未署名状態を明示する。
- 既存Workspace、input、asset、outputを変更しない。
- failureは非0で終了し、日本語のactionと証跡pathを表示する。

### U11-FR-3: Clean-profile Smoke Checklist

- 新規Apple Silicon Macまたは新規macOS user profileで実行可能な日本語checklistを提供する。
- 必須smokeは次に限定する。
  1. ZIPとSHA-256を受領・照合する。
  2. アプリを起動する。
  3. 空folderをWorkspaceとして選択する。
  4. `sample-video`を開く。
  5. VOICEVOXを用意できる場合は通常Render、用意できない場合は既存音声または`--skip-voice`相当の開発者支援手順でRenderを確認する。
  6. non-zero MP4を確認する。
- Codex、VOICEVOX診断、編集、素材、Stop、Finder reveal、更新／Rollbackは追加確認項目とし、最小合格を妨げない。
- 実行環境がないU11内ではchecklistを「未実行」と明記し、合格済みにしない。

### U11-FR-4: Acceptance Evidence Template

- Markdown templateへ次を記録できる。
  - 実行日時、実行者、Mac model、CPU architecture、macOS version。
  - app version、Git revision、ZIP名、SHA-256。
  - 各stepのPass／Fail／Blocked／Not Run。
  - screenshot、log、MP4などの証跡path。
  - failure概要、回避策、再試験結果。
- Credential、token、個人情報、不要な絶対pathを記録しない注意を含める。

### U11-FR-5: Post-MVP Backlog

- 次の候補を重複なく一覧化し、利用者価値、依存、risk、概算規模、Roadmap区分を記録する。
  - シリーズ管理。
  - テンプレートライブラリ。
  - 複数Workspace管理。
  - サムネイル自動生成。
  - YouTubeアップロード。
  - Auto Update。
  - DMG／PKG。
  - Universal Binary／Intel Mac。
  - Render queue。
  - ログ永続化。
  - Preview filesystem watcher。
  - Cloud共有／複数ユーザー。
  - API-key型の代替AI provider。
  - Codex完全自動実行。
- 完全自動実行は既存のHuman Approval境界を弱めるためFutureへ置く。
- Cloud共有、複数ユーザー、認証、中央監視はローカル方針と異なるためFutureへ置く。

### U11-FR-6: Roadmap

- **Next**: シリーズ管理、テンプレートライブラリ、複数Workspace管理。
- **Later**: サムネイル、YouTube、Render queue、ログ永続化、Preview watcher。
- **Future**: Auto Update、DMG／PKG、Universal Binary、Cloud共有、代替AI provider、完全自動実行。
- Roadmapは日付や工数を確約せず、依存関係とexit criteriaで管理する。
- 各項目の移動は要件・risk・価値の再評価と承認を必要とする。

## 上位3件の詳細仕様要件

### NEXT-1: シリーズ管理

#### 目的

複数のvideo IDを一つのシリーズとして整理し、順序、共通metadata、制作状態を把握する。

#### User Journey

1. 利用者がシリーズを作成する。
2. 既存video IDを追加または新規videoを作る。
3. episode順を変更し、各videoの制作状態を確認する。
4. videoを現在の単一video Workspace画面で開く。

#### 機能要件

- Series ID、title、description、ordered video IDs、statusを持つ。
- 既存`input/{videoId}.json`を移動・複製せず参照する。
- 存在しないvideo ID、重複ID、同一シリーズ内の重複を検証する。
- 並べ替えは明示保存までcanonical dataへ反映しない。
- Series削除はvideo script、asset、audio、outputを削除しない。
- 既存single-video workflowはシリーズなしでも利用できる。

#### Data／UI

- Series metadataはWorkspace内のversion付きJSONとして保存する。
- Rendererへはpurpose-specific typed APIだけを公開する。
- Start screenへシリーズ一覧、作成、名称変更、video追加、並べ替え、開くを追加する。

#### NFR／受入条件

- 100 episodesまで通常操作が滑らかである。
- 保存はatomicで、invalid dataでは既存fileを維持する。
- Serialize／parse round-tripとordered unique invariantをPartial PBT対象とする。
- シリーズ削除後も全videoを単独で開ける。

#### 対象外

- YouTube playlist同期、共同編集、episode一括Render。

### NEXT-2: テンプレートライブラリ

#### 目的

繰り返し使うvideo設定とscene構成を安全に再利用し、新規台本作成時間を短縮する。

#### User Journey

1. 利用者がbuilt-inまたはWorkspace templateを選ぶ。
2. title、video ID、必要なplaceholderを入力する。
3. 生成previewを確認する。
4. 新しいdraftとして作成し、U3 Applyで保存する。

#### 機能要件

- Template ID、name、description、schema version、script skeleton、placeholder定義を持つ。
- Built-in templateはread-only、Workspace templateは利用者が作成・編集・削除できる。
- Template適用はactive scriptを直接上書きせず、常にdraftを作る。
- Placeholder未入力、型不一致、未知field、対応外schema versionを拒否する。
- Templateから作成したdraftは既存VideoScript schemaで検証する。
- Asset binaryをtemplateへ埋め込まず、必要assetを明示する。

#### Data／UI

- Workspace templateはWorkspace内の専用directoryへversion付きJSONで保存する。
- Template選択、説明、必要入力、draft preview、Apply取消を提供する。

#### NFR／受入条件

- Template parserはbounded inputとruntime validationを持つ。
- Serialize／parse round-trip、placeholder置換後schema-valid invariantをPartial PBT対象とする。
- Template失敗時にactive scriptと既存draftを変更しない。

#### 対象外

- Online marketplace、外部template download、remote code／plugin実行。

### NEXT-3: 複数Workspace管理

#### 目的

複数の制作folderを安全に切り替え、毎回file dialogから探す手間を減らす。

#### User Journey

1. 利用者が最近使ったWorkspace一覧を開く。
2. canonical path、表示名、最終利用日時を確認する。
3. 一つを選択して切り替える。
4. 移動・削除・権限喪失時は再選択または一覧から削除する。

#### 機能要件

- 保存するのはWorkspace参照、表示名、最終利用日時だけとする。
- 同時にactiveなWorkspaceは一つだけとする。
- PathはMainでcanonical validationし、Rendererへ任意filesystem accessを与えない。
- 重複canonical pathを一件へ正規化する。
- 切替中の未保存draft、実行中command、Codex turnがある場合は明示確認する。
- 実行中commandを別Workspaceへ引き継がない。
- 一覧削除はWorkspace contentsを削除しない。

#### Data／UI

- Electron `userData`へversion付きreference listをatomic保存する。
- First RunとStart screenへ最近使ったWorkspace、追加、名称変更、削除、再検証を追加する。

#### NFR／受入条件

- 無効参照はfail closedで、別pathへfallbackしない。
- Reference listのserialize／parse round-trip、canonical path uniquenessをPartial PBT対象とする。
- Workspace切替後、Script、Codex、Preview、Renderは新しいrootだけを使う。

#### 対象外

- 複数Workspace同時window、cloud sync、Workspace contentsの移動・複製。

## 非機能要件

### U11-NFR-1: Security

- FileVaultを有効にしたMacを推奨し、受入記録で暗号化状態を確認できるようにする。
- ZIPはSHA-256で照合し、未署名`local-acceptance`を一般公開しない。
- Gatekeeper無効化、quarantine削除、任意shell commandを案内しない。
- README、report、logへtoken、credential、個人情報を含めない。
- 将来のseries、template、Workspace dataはruntime schemaで検証する。
- Rendererのcontext isolationとpurpose-specific IPC境界を維持する。

### U11-NFR-2: Resiliency

- Workload criticalityはLowとする。
- RTOは数時間、RPOは直近の手動backup時点とする。
- DRはlocal Backup & Restoreとし、cloud、multi-zone、multi-regionはN/Aとする。
- 変更管理はGit commit、AI-DLC audit、変更概要、承認、Rollback noteで行う。
- Build／配布はlocal npm commandとchecklistで行う。
- Rollbackは直前の既知正常ZIP／`.app`への置換とし、Workspaceを維持する。
- Deployment styleは利用者ごとのdirect／in-placeとする。
- IncidentはIssueまたはMarkdownへ症状、影響、回避策、原因、修正、再発防止を残す。
- Codex、VOICEVOX、filesystem処理はtimeout、failure containment、manual recoveryを維持する。

### U11-NFR-3: Usability／Accessibility

- READMEとchecklistは日本語、Desktop-first、非開発者向けとする。
- Commandをcopy可能なcode blockで示し、期待結果と失敗時actionを併記する。
- 必須smokeと追加確認を明確に分ける。
- UI変更が発生する将来仕様はkeyboard操作、accessible name、status announcementを要求する。

### U11-NFR-4: Testability

- Acceptance preflightは外部状態を注入可能にし、実Workspaceを変更しない。
- Artifact missing、checksum mismatch、wrong architecture、wrong release stateをexample testする。
- 新しいpure serializer／parser／normalizerだけをPartial PBT対象とする。
- fast-checkのshrinkingとseed replayを維持する。

### U11-NFR-5: Maintainability

- READMEは利用者向け導線と開発者向け導線を見出しで分離する。
- Releaseのsingle source of truthはmanifestと既存release scriptsとし、READMEへ同じlogicを再実装しない。
- 将来機能仕様は既存Workspace、VideoScript、Command Runner、Codex approval境界を再利用する。

## Acceptance Criteria

1. READMEの先頭から非開発者がDesktop導入と最小smokeを完了できる。
2. `local-acceptance`と一般配布禁止がREADMEとchecklistで明示される。
3. 一つのpreflight commandがartifact、checksum、architecture、release state、build／test gateを検証する。
4. 新規Mac用checklistとevidence templateが完成し、実機未実行と明記される。
5. Post-MVP候補がNext／Later／Futureへ分類される。
6. Series、Template、Multiple Workspaceが実装判断可能な仕様を持つ。
7. 既存CLI、Workspace、VideoScript、Human Approval、public release gateを破壊しない。
8. Security、Resiliency、Partial PBTにblocking findingがない。

## U11対象外

- 新規Macまたは別user profileでの実smoke実行。
- 将来機能のapplication code実装。
- Apple credential取得、実署名、公証、一般公開。
- CI/CD pipeline、cloud deployment、central monitoring。
- Auto Update、DMG／PKG、Universal Binaryの実装。

## Extension Compliance

### Security Baseline

- **Compliant**: SECURITY-01、05、09〜13、15。OS暗号化、checksum、入力検証、hardening、supply chain、approval境界、credential非保存、fail closedを要件化した。
- **N/A**: SECURITY-02〜04、06〜08、14。Network intermediary、HTML-serving endpoint、cloud IAM／network、multi-user authentication、central alertingを持たないlocal desktop appである。
- **Blocking finding**: なし。

### Resiliency Baseline

- **Compliant**: RESILIENCY-01〜04、10〜15。Low criticality、RTO／RPO、Backup & Restore、軽量変更管理、local build、Rollback、incident記録、依存隔離、受入／復旧を要件化した。
- **N/A**: RESILIENCY-05〜09。Cloud deployment、traffic endpoint、central observability、multi-zone、auto-scalingを持たない。
- **Blocking finding**: なし。

### Property-Based Testing Partial

- **Enforced**: PBT-02、03、07、08、09。上位3仕様のserialize／parse、uniqueness／schema invariant、domain generator、shrinking、seed replay、fast-checkを要求した。
- **Advisory**: PBT-01、04〜06、10。
- **Blocking finding**: なし。

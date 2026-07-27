# U10 ユーザーストーリー

## 記載方針

- **整理方法**: 利用者ジャーニー別
- **粒度**: 1つの受入確認で完結する実装可能な単位
- **受入条件**: Given／When／Then形式
- **優先度**: Must／Should／Could
- **要件対応**: U10要件IDを各ストーリーへ記載

## 動画制作者のジャーニー

### US-1: 配布ZIPから安全に導入する

**優先度**: Must
**ペルソナ**: P1

動画制作者として、検証済みZIPからアプリを導入したい。そうすることで、不明な回避操作をせず安全に利用を始められる。

**受入条件**

- Given 署名・公証済みarm64 ZIPがある、When 展開してアプリを初回起動する、Then Gatekeeperによる通常の確認後にアプリが起動する。
- Given 利用者文書を開く、When 導入手順を確認する、Then Gatekeeperを無効化する案内はなく、対応macOSと外部依存が日本語で示される。

**要件対応**: U10-FR-1、U10-FR-8、U10-FR-12、U10-FR-13、U10-NFR-5

### US-2: 初回起動時にWorkspaceを選択する

**優先度**: Must
**ペルソナ**: P1

動画制作者として、制作データを置くfolderを自分で選びたい。そうすることで、アプリ本体とWorkspaceを分離して管理できる。

**受入条件**

- Given 保存済みWorkspaceがない、When アプリを起動する、Then folder選択が表示され、選択完了まで制作操作は開始されない。
- Given folderを選択した、When 構造と書込権限が有効である、Then 参照だけが`userData`へ保存されWorkspaceが開く。
- Given 許可外pathまたは利用不能folderを選択した、When 検証する、Then 書込みを行わず日本語で再選択を案内する。

**要件対応**: U10-FR-2、U10-FR-3、U10-NFR-1、U10-NFR-5

### US-3: Workspaceを安全に復元する

**優先度**: Must
**ペルソナ**: P1

動画制作者として、再起動後に前回のWorkspaceへ戻りたい。そうすることで、毎回folderを選び直さず制作を継続できる。

**受入条件**

- Given 保存済みWorkspaceが利用可能である、When アプリを再起動する、Then canonical pathを再検証して同じWorkspaceを開く。
- Given Workspaceが移動、削除、または権限喪失している、When アプリを起動する、Then 許可外へfallbackせず再選択を案内する。

**要件対応**: U10-FR-3、U10-NFR-1、U10-NFR-2

### US-4: Codex CLI不足を診断する

**優先度**: Must
**ペルソナ**: P1

動画制作者として、Codexが使えない理由を知りたい。そうすることで、install、upgrade、loginの適切な復旧操作を選べる。

**受入条件**

- Given Codex CLIが未導入、version不足、または未loginである、When Real接続を開始する、Then 状態を区別した日本語案内を表示する。
- Given Codexが利用不能である、When 制作を続ける、Then Mock、script、asset、Preview、Renderの利用可能な機能は維持される。
- Given 診断を実行する、When logと設定を確認する、Then tokenやlogin情報は保存・表示されない。

**要件対応**: U10-FR-5、U10-FR-12、U10-NFR-1、U10-NFR-5

### US-5: VOICEVOX不足を診断する

**優先度**: Must
**ペルソナ**: P1

動画制作者として、音声生成できない理由を知りたい。そうすることで、install、起動、version、接続先を修正できる。

**受入条件**

- Given VOICEVOXが未導入、未起動、またはversion非対応である、When Voiceを実行する、Then 状態を区別した日本語案内を表示する。
- Given VOICEVOXが利用不能である、When 制作を続ける、Then script編集、Codex、利用可能なPreview、既存音声によるRenderは妨げられない。

**要件対応**: U10-FR-6、U10-FR-12、U10-NFR-2、U10-NFR-5

### US-6: アプリを更新またはロールバックする

**優先度**: Should
**ペルソナ**: P1

動画制作者として、Workspaceを失わずアプリを入れ替えたい。そうすることで、新版への更新と既知正常版への復旧を安全に行える。

**受入条件**

- Given 新しい検証済みZIPがある、When アプリを置き換える、Then bundle外のWorkspaceと保存済み参照は保持される。
- Given 新版に問題がある、When 直前の既知正常版へ置き換える、Then 対応するWorkspace互換性情報と復旧手順を確認できる。

**要件対応**: U10-FR-11、U10-FR-12、U10-NFR-2

## リリース担当者のジャーニー

### US-7: ローカル検証用成果物を生成する

**優先度**: Must
**ペルソナ**: P2

リリース担当者として、Apple認証情報がなくてもarm64アプリを検証したい。そうすることで、署名・公証以外の品質確認を先に完了できる。

**受入条件**

- Given clean install済みのsourceとlockfileがある、When local package commandを実行する、Then production Main、Preload、Rendererを含むarm64 `.app`とZIPを生成する。
- Given 認証情報がない、When packageが成功する、Then 成果物は`local-acceptance`と明示され、一般配布可能とは表示されない。
- Given packaged appを起動する、When production flowを使用する、Then `tsx`、TypeScript source、開発server、`NODE_OPTIONS`へ依存しない。

**要件対応**: U10-FR-1、U10-FR-2、U10-FR-8、U10-NFR-3

### US-8: Packaged環境で制作機能を検証する

**優先度**: Must
**ペルソナ**: P2

リリース担当者として、source treeのない配布環境で主要機能を確認したい。そうすることで、開発環境だけで動く不具合を公開前に検出できる。

**受入条件**

- Given packaged appと選択済みWorkspaceがある、When Script、asset、Validate、Preview、Renderを実行する、Then packaged resourceとWorkspaceの正規化済みpathだけを使用して完了する。
- Given 実行中の処理がある、When StopまたはFinder revealを操作する、Then 既存の停止・表示機能がpackaged環境でも動作する。

**要件対応**: U10-FR-4、U10-FR-13、U10-NFR-1

### US-9: 署名・公証を設定する

**優先度**: Must
**ペルソナ**: P2

リリース担当者として、Developer IDで署名・公証した成果物を生成したい。そうすることで、Mac App Store外で安全に配布できる。

**受入条件**

- Given 有効なDeveloper IDと公証用認証情報がある、When release makeを実行する、Then Hardened Runtime、secure timestamp、最小entitlementsを用いて署名し、notarytoolによる公証を行う。
- Given entitlementsを検査する、When 配布候補を検証する、Then `com.apple.security.get-task-allow`は存在しない。
- Given 認証情報または公証が不足・失敗している、When release makeを実行する、Then fail closedで終了し、成功扱いしない。

**要件対応**: U10-FR-7、U10-FR-8、U10-NFR-1

### US-10: 一般配布をゲートする

**優先度**: Must
**ペルソナ**: P2

リリース担当者として、必須検証に合格した成果物だけを配布可能と判定したい。そうすることで、未署名・未公証成果物の誤配布を防げる。

**受入条件**

- Given 配布候補がある、When release verificationを実行する、Then codesign、Gatekeeper、公証ticket、ZIP checksumを検証する。
- Given いずれかの検証が失敗する、When 判定を完了する、Then publishable状態へ遷移せず非ゼロで終了する。
- Given local acceptance成果物がある、When release verificationを実行する、Then 一般配布禁止であることを明示する。

**要件対応**: U10-FR-8、U10-NFR-1、Property-Based Testing要件

### US-11: 成果物の整合性と由来を記録する

**優先度**: Must
**ペルソナ**: P2

リリース担当者として、成果物の内容と生成元を確認したい。そうすることで、同一versionの再検証と改ざん検知ができる。

**受入条件**

- Given packageが生成された、When release metadataを作成する、Then SBOM、SHA-256、version、Git revision、architectureをmanifestへ記録する。
- Given app bundleとZIPを検査する、When inclusion policyを適用する、Then secret、test fixture、不要source map、開発設定、既存Workspaceを含めない。
- Given 同一versionの旧出力がある、When 新しいreleaseを開始する、Then 暗黙に再利用せずversionとarchitectureで識別する。

**要件対応**: U10-FR-9、U10-FR-10、U10-NFR-3、U10-NFR-4

### US-12: リリース品質を再現可能に検証する

**優先度**: Must
**ペルソナ**: P2

リリース担当者として、最小の一連のcommandで品質を確認したい。そうすることで、公開判断を再現可能にできる。

**受入条件**

- Given release候補がある、When release gateを実行する、Then audit、typecheck、既存回帰、U10例示テスト、PBT、Studio build、package smokeを順に検証する。
- Given propertyが失敗する、When 結果を保存する、Then fast-check seedと縮小後の反例から再実行できる。
- Given 新規macOS利用者プロファイルがある、When acceptance checklistを実行する、Then 初回起動、Workspace、依存診断、制作、停止、reveal、更新・復旧を確認できる。

**要件対応**: U10-FR-9、U10-FR-10、U10-FR-13、U10-NFR-6、Property-Based Testing要件

## INVEST確認

- **Independent**: 各ストーリーは1つの利用者成果または配布判定を対象とする。
- **Negotiable**: 実装手段は要件で固定された安全境界以外を拘束しない。
- **Valuable**: P1またはP2へ直接的な価値を提供する。
- **Estimable**: 要件IDと単一の受入目的により見積可能である。
- **Small**: 1つの受入確認で完結する粒度へ分割した。
- **Testable**: すべてGiven／When／Then形式の受入条件を持つ。

## Extension準拠

- **Security Baseline**: secret非露出、path境界、CSP／IPC hardening、署名、公証、checksum、fail-closedをUS-2、US-4、US-7〜US-11へ反映した。未解決のblocking findingなし。
- **Resiliency Baseline**: 依存障害、Workspace消失、更新、rollback、package／公証失敗、clean-profile recoveryをUS-3〜US-6、US-9、US-12へ反映した。Cloud固有規則は適用外。
- **Property-Based Testing**: path、設定、manifest、release状態遷移のpropertyとseed再現をUS-10〜US-12へ反映した。未解決のblocking findingなし。

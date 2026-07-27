# U10 デスクトップパッケージング・リリース準備 要件

## 意図分析

- **ユーザー要求**: U10としてデスクトップパッケージングとリリース準備を実装する。
- **要求種別**: 既存Electronアプリケーションの配布機能追加とリリース品質強化。
- **対象範囲**: Electron Main／Preload／Renderer build、Workspace保存先、外部依存確認、Forge設定、署名・公証設定、アーティファクト検証、文書、テスト。
- **複雑度**: 高。開発時の`process.cwd()`とTypeScript直接実行を、配布可能な実行レイアウトへ変更し、macOSの信頼境界とユーザーデータ保護を扱う。
- **対象利用者**: Apple Silicon Macを使用する動画制作者。
- **リリース担当者**: ローカルMacで検証・署名・公証・配布を行う開発者。

## 確定した製品判断

- Mac App Store外で一般配布する署名・公証済みアプリを最終目標とする。
- U10の対象architectureはApple Silicon arm64のみとする。
- Electron Forgeを使用し、`.app`とZIPを生成する。
- 製品名は`Zundamon Video Generator`とする。
- bundle IDは`com.tomimorisatoshihare.zundamon-video-generator`とする。
- Workspaceは利用者が選択したproject folderとし、選択状態だけをElectron `userData`へ保存する。
- Codex CLIとVOICEVOX Engineはbundleせず、外部依存として確認・案内する。
- リリース処理はローカルスクリプトに限定し、CIリリースとauto-updateは対象外とする。
- 認証情報がない間は未署名のローカル検証用アーティファクトを生成できる。
- 署名・公証の設定と検証手順はU10で完成させる。
- 認証情報を使った署名・公証が成功するまで一般配布を禁止する。

## 機能要件

### U10-FR-1: Electron Forgeパッケージング

- Electron Forgeを開発依存としてexact versionで導入する。
- arm64向け`.app`とZIPを生成する`package`／`make`コマンドを提供する。
- 出力先、アーティファクト名、製品名、bundle ID、versionを決定的に設定する。
- default Electron brandingを残さず、一時生成したapplication iconを設定する。
- DMG、PKG、x64、Universal、Mac App Store向けartifactは生成しない。

### U10-FR-2: 本番用Main／Preload／Renderer build

- Main、Preload、Rendererをpackaging前にJavaScriptへbuildする。
- packaged applicationは`tsx`、TypeScript source、開発server、`NODE_OPTIONS`に依存せず起動する。
- packaged Main entryを`package.json`の`main`として明示する。
- `app.isPackaged`に基づき、開発時とpackaged時のresource pathを正しく解決する。
- ASAR内の読み取り専用resourceと、利用者が変更するWorkspace dataを分離する。

### U10-FR-3: Workspace選択と永続化

- 初回起動時、利用者にproject folderを選択させる。
- 選択したfolderが必要なWorkspace構造を持つか、作成可能かを検証する。
- 選択したfolderの参照だけをElectron `userData`配下へ保存する。
- 起動時に保存済みfolderを再検証し、存在しない・権限がない・不正な場合は再選択を案内する。
- Rendererは任意pathや`userData`の内容を直接操作できない。
- 既存CLIはrepository/current working directoryを用いる現行動作を維持する。

### U10-FR-4: Packaged command実行

- Mainは選択済みWorkspaceとpackaged resourceのcanonical pathを使ってValidate、Voice、Timeline、Preview、Renderを実行する。
- shell文字列連結を使わず、固定された実行対象と検証済み引数を使用する。
- packaged applicationに必要なRemotion entry、public assets、CLI runtimeを含める。
- 開発用source layoutが存在しない環境でもproduction commandsを実行できる。
- Stop、progress、ETA、retry、overwrite、Finder revealを維持する。

### U10-FR-5: Codex CLI事前確認

- 起動時またはReal接続時に`codex` executableの存在と対応versionを確認する。
- login状態を安全に確認し、未install、version不足、未loginを区別して日本語で案内する。
- install／upgrade／loginの手順をend-user documentationへ記載する。
- Codex executable、token、login情報をapplicationへbundleまたは保存しない。
- Codex利用不可でもMock、script、asset、production機能を利用できる。

### U10-FR-6: VOICEVOX事前確認

- Voice実行前にVOICEVOX Engineへの接続と対応versionを確認する。
- 未install、未起動、非対応versionを区別して日本語で案内する。
- install／start／接続先設定をend-user documentationへ記載する。
- VOICEVOX Engineをapplicationへbundleしない。
- VOICEVOX利用不可でもscript編集、Codex、Preview可能範囲、既存音声を使うRenderを維持する。

### U10-FR-7: 署名・公証設定

- Developer ID Applicationを使用するmacOS code-sign設定をForgeへ追加する。
- Hardened Runtime、secure timestamp、必要最小限のentitlementsを設定する。
- `com.apple.security.get-task-allow`を有効にしない。
- `notarytool`を使用する公証設定とstaple確認手順を用意する。
- Apple ID、app-specific password、team ID、certificateをsource、artifact、logへ保存しない。
- 認証情報がない場合、署名・公証処理を誤って成功扱いしない。

### U10-FR-8: 配布禁止ゲート

- 未署名または未公証artifactを「一般配布可能」と表示しない。
- 公開用検証コマンドはcodesign、Gatekeeper、notarization ticket、ZIP checksumを確認する。
- 必須検証が失敗した場合、公開用artifactの完成を失敗として終了する。
- 認証情報がない間のartifactは`local-acceptance`用途として明示する。

### U10-FR-9: リリース整合性

- production dependencyだけを含む最小packageを生成する。
- package-lockを使用して依存関係を固定する。
- リリースごとにSBOM、SHA-256 checksum、version、Git revision、architectureを記録したmanifestを生成する。
- `npm audit --audit-level=high`、typecheck、tests、Studio build、package smokeをrelease gateにする。
- 生成したapp bundleとZIPにsecret、test fixture、不要なsource map、開発用設定を含めない。

### U10-FR-10: ローカルリリース操作

- `package`、`make`、`verify:package`、`verify:release`に相当する明確なnpm commandを提供する。
- コマンドは失敗理由と復旧方法を日本語で表示する。
- 同一versionの既存出力を暗黙に公開用成果物として再利用しない。
- release outputをversionとarchitectureで識別できる。
- GitHub Actionsや外部release serviceを必須にしない。

### U10-FR-11: 手動更新とロールバック

- U10ではauto-updateを実装しない。
- 利用者は新しいZIPをdownloadし、applicationを置き換えて更新する。
- Workspace dataをapplication bundle外に保持し、application更新で削除しない。
- 既知の正常な旧versionへapplicationを置き換えるロールバック手順を提供する。
- version間のWorkspace互換性と移行要否をrelease checklistで確認する。

### U10-FR-12: 初回利用・運用文書

- Install、First Run、Workspace、Codex、VOICEVOX、Privacy、Permissions、Update、Rollback、Recovery文書を日本語で提供する。
- 一般配布禁止ゲートと、認証情報がない状態の制約を明記する。
- Gatekeeper警告を無効化する手順を通常の導入方法として案内しない。
- applicationが読み書きするfolder、起動するprocess、接続するlocal serviceを説明する。

### U10-FR-13: Clean-machine受入確認

- 新規macOS user profileでZIP展開とapplication起動を確認する。
- Gatekeeperの初回起動表示、Workspace選択・再起動復元を確認する。
- Mock、Codex dependency診断、VOICEVOX dependency診断を確認する。
- Script、asset、Validate、Preview、Render、Stop、Finder revealを確認する。
- 認証情報が利用可能になった時点で署名・公証済みartifactの同一checklistを再実行する。

## 非機能要件

### U10-NFR-1: セキュリティ

- Rendererは`contextIsolation: true`、`nodeIntegration: false`を維持する。
- Content Security Policyを設定し、packaged Rendererが不要な外部contentや`unsafe-eval`へ依存しない。
- 一般配布用のbuild・署名を行うMacと、利用者のWorkspace保存先ではFileVaultなどOS管理の保存時暗号化を有効にする。
- 公証、dependency取得、release artifact配布など外部とのdata transferはTLS 1.2以上を使用する。
- Workspace、resource、userDataのpathをcanonical化し、許可root外へのアクセスを拒否する。
- packaging/release commandでsecretを引数、標準出力、artifact、manifestへ出さない。
- 依存関係をlockし、脆弱性監査、SBOM、署名、checksumでsoftware supply chainを検証する。
- external input、manifest、保存設定をruntime validationしてから使用する。
- 例外時はfail closedとし、resource、child process、temporary fileをcleanupする。

### U10-NFR-2: 信頼性と復旧

- Workload criticalityは個人用ローカルツールとしてLowとする。
- Cross-region DR、SLA、multi-zone、traffic failoverは適用外とする。
- Workspace dataのRPO/RTOは利用者の通常backupに依存し、application更新でdataを変更しない。
- package失敗、公証失敗、外部依存不足、Workspace消失からの手動復旧手順を提供する。
- release変更はGit history、package-lock、AI-DLC audit、release manifestで追跡する。
- ロールバック対象は直前の署名・公証済み既知正常versionとする。

### U10-NFR-3: 再現性

- clean installから同じversion／architectureのartifactを再生成できる。
- build時刻など不可避な差分を除き、manifestの入力情報を明示する。
- packageは開発Mac固有の絶対path、home directory、credentialへ依存しない。
- 未署名artifactと公開可能artifactを命名・出力場所・検証結果で区別する。

### U10-NFR-4: 性能と容量

- packaged起動で開発serverやruntime TypeScript変換を行わない。
- application packageへtest、cache、generated output、既存Workspaceを含めない。
- package size、起動時間、最初のWorkspace表示時間をrelease checklistで記録する。
- 明示的な性能保証値は初回package計測後に確定する。

### U10-NFR-5: 利用性とアクセシビリティ

- First Run、依存診断、署名状態、release failureを日本語のactionable messageで表示する。
- file dialog、status、error、buttonはkeyboard操作とaccessible labelを維持する。
- 開発者向けstack traceや内部pathを通常利用者へ表示しない。

### U10-NFR-6: テスト可能性

- package path、version、architecture、manifest、Workspace設定の純粋ロジックをI/Oから分離する。
- 具体例テスト、完全PBT、fake filesystem/process、packaged Electron E2Eを組み合わせる。
- PBT failureはfast-checkのseedと縮小後の反例を記録し再実行可能にする。
- 実署名・公証がdeferredの間も、設定schema、credential非露出、失敗ゲートを自動検証する。

## Property-Based Testing要件

- **往復変換**: Workspace設定とrelease manifestのserialize／parseがJSON正規化後に同値となる。
- **不変条件**: 任意の有効Workspace入力で解決pathが選択rootまたは許可resource rootの外へ出ない。
- **冪等性**: Workspace設定の正規化とrelease manifest正規化を複数回適用しても結果が変わらない。
- **範囲制約**: version、bundle ID、architecture、artifact名、checksumが定義format外を受理しない。
- **状態モデル**: local acceptance、signed、notarized、verified、publishableの状態遷移で前段階を飛ばせない。
- **Oracle比較**: release file inclusion policyを単純なallowlist modelと比較する。
- すべての重要経路に具体例テストも用意する。

## 受入条件

1. arm64 `.app`とZIPをElectron Forgeで生成できる。
2. packaged applicationがTypeScript runtimeや開発serverなしで起動する。
3. 初回にproject folderを選択し、再起動後に安全に復元できる。
4. packaged環境でScript、asset、Mock、Validate、Preview、Render、Stop、revealが動作する。
5. CodexとVOICEVOXの不足状態を区別し、日本語の復旧手順を表示する。
6. 未署名artifactをlocal acceptance用途として生成・検証できる。
7. 署名・公証設定、Hardened Runtime、notarytool、公開用検証gateが実装される。
8. 認証情報がない間、一般配布可能artifactの完成を成功扱いしない。
9. SBOM、checksum、release manifestを生成し、secretと不要fileが含まれない。
10. 33ファイル・125テストを含む既存回帰、U10例示テスト、完全PBT、package E2Eが成功する。
11. 新規macOS user profile向けchecklistと日本語の利用者文書が完成する。
12. Security、Resiliency、PBTの適用可能な規則にblocking違反がない。

## 対象外

- Intel x64、Universal binary。
- DMG、PKG、Mac App Store。
- Codex CLIまたはVOICEVOX Engineのbundle。
- GitHub ActionsなどのCI release pipeline。
- Auto-updateとupdate server。
- 実認証情報が提供される前の署名・公証成功。
- credential取得やApple Developer Programへの加入代行。
- cloud deployment、centralized monitoring、multi-region DR。

## Extension準拠

### Security Baseline

- **準拠**: SECURITY-01、05、09、10、11、13、15。OS管理の保存時暗号化とTLS、入力検証、hardening、lock/audit/SBOM、署名/checksum、fail-closedを要求した。
- **適用外**: SECURITY-02、03、04、06、07、08、12、14。Network intermediary、deployed centralized service、HTML-serving endpoint、IAM policy、cloud network、multi-user application endpoint、application-owned authentication、centralized alertingを持たないローカル個人用アプリである。CSP、local redacted diagnostic、最小権限IPC、credential非保存は追加防御として引き続き要求する。
- **未解決のblocking finding**: なし。

### Resiliency Baseline

- **要件で適用**: RESILIENCY-01、02、03、04、10、14、15。Criticality、data保護、release変更、rollback、依存障害、recovery checklist、fault-injection方針を要求した。
- **適用外**: RESILIENCY-05〜09、11〜13。Cloud deployment、regional topology、production traffic、managed data store、DR failoverを持たない。
- **未解決のblocking finding**: なし。

### Property-Based Testing

- **要件で適用**: PBT-01〜10。Packagingのpath、config、manifest、state transitionにpropertyを定義し、fast-check 4.9.0、shrinking、seed再現、具体例テスト併用を要求した。
- **未解決のblocking finding**: なし。

## 公式参考資料

- [Electron Application Packaging](https://www.electronjs.org/docs/latest/tutorial/application-distribution/)
- [Electron Packaging Tutorial](https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging)
- [Electron Code Signing](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- [Apple Notarizing macOS Software](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)

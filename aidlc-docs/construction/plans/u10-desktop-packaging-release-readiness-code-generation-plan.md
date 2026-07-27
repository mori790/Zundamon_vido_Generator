# U10 Code Generation計画

この文書をU10実装のsingle source of truthとする。各項目を完了した同じinteractionで直ちに`[x]`へ更新する。

## Unit Context

- **Unit**: `u10-desktop-packaging-release-readiness`
- **Stories**: US-1〜US-12
- **Workspace**: `/Users/tomimorisatoshihare/Zundamon_vido_Generator`
- **既存境界**: Electron Main／typed Preload／React Renderer／CLI／Remotion
- **外部依存**: Codex CLI、VOICEVOX、Apple signing／notarytool
- **Database**: なし
- **Infrastructure**: なし
- **対象外**: x64／Universal、DMG／PKG／MAS、auto-update、CI release、credential取得

## Planning完了項目

- [x] Requirements、Stories、Application／Functional／NFR Designを確認する。
- [x] Existing source、tests、package scripts、component interfaceを確認する。
- [x] Brownfieldの既存fileをin-place変更し、新規fileを最小化する方針を確認する。
- [x] Application codeはWorkspace root、Markdown summaryだけを`aidlc-docs`へ置く。
- [x] Story traceabilityと検証gateを各stepへ割り当てる。

## Step 1: BaselineとPackaging Dependency

- [x] `package.json`、`package-lock.json`、TypeScript／Vite／Electron entryを再確認する。
- [x] Baselineのtypecheck、default tests、Studio build、Electron E2E、npm auditを実行する。
- [x] `@electron-forge/cli@7.11.2`と`@electron-forge/maker-zip@7.11.2`をexact devDependencyで追加する。
- [x] package identity、macOS 13、arm64、main entry、package／make scriptsの骨格を追加する。

**Story**: US-7、US-11、US-12

## Step 2: Pure Workspace／Release Domain

- [x] `src/studio/shared/workspace.ts`をWorkspaceReference、WorkspaceState、runtime validationで拡張する。
- [x] 最小のshared release moduleを追加し、manifest normalize、artifact inclusion、release state transitionをpure functionで実装する。
- [x] Workspace round-trip／idempotence／path invariantとrelease state／manifest／allowlistのexample＋PBTを追加する。
- [x] 通常100 run、release 1,000 run、seed replayをnpm scriptsへ反映する。

**Story**: US-2、US-3、US-10、US-11、US-12

## Step 3: Production Main／Preload／Renderer Build

- [x] Existing Vite buildをRenderer production outputとして維持する。
- [x] esbuildでMainとPreloadをproduction JavaScriptへbuildするscriptを追加する。
- [x] `package.json.main`をcompiled Main entryへ変更し、development startはcompiled entryを使用する。
- [x] `app.isPackaged`対応の最小Resource Resolverを追加する。
- [x] Packaged runtimeが`tsx`、TypeScript source、dev server、`NODE_OPTIONS`に依存しないことをtestする。

**Story**: US-7、US-8

## Step 4: Workspace ServiceとFirst Run

- [x] MainにWorkspace選択、canonical validation、必須4 directory作成、atomic参照保存、起動時再検証を実装する。
- [x] Existing local-file、command、preview、render、Codexへ検証済みWorkspace rootを供給する。
- [x] Shared typed contract、Main IPC handler、Preload `workspaceApi`を追加する。
- [x] Rendererにblocking First Run view、Workspace status、再選択を追加する。
- [x] Interactive elementへ安定した`data-testid`、accessible name、focus／live regionを追加する。
- [x] Missing、denied、unsafe、partial-create cleanupをexample＋PBT＋component testで検証する。

**Story**: US-2、US-3

## Step 5: Dependency Diagnosis

- [x] MainにCodex／VOICEVOX adapterとDiagnosis Coordinatorを追加する。
- [x] Codex 5秒、VOICEVOX 3秒timeout、起動後parallel diagnosis、利用直前再診断を実装する。
- [x] Missing、stopped、unsupported、unauthenticated、unreachableを安定action codeへ分類する。
- [x] Preload `dependencyApi`とRendererの日本語Dependency Status UIを追加する。
- [x] Credential／internal path redaction、failure containment、manual retryをtestする。

**Story**: US-4、US-5

## Step 6: Packaged Command Compatibility

- [x] Existing Command RunnerへWorkspace rootとpackaged resource entryを注入する。
- [x] Validate、Voice、Timeline、Preview、Renderを固定executable／argvで実行する。
- [x] Existing Stop、progress、ETA、retry、overwrite、Finder revealを維持する。
- [x] Source treeなしのfake packaged layoutでScript、asset、Preview、Render pathをintegration testする。
- [x] Repository cwdを使う既存CLIの動作が変わらないことをtestする。

**Story**: US-8

## Step 7: Forge、Signing、Release Gate

- [x] Forge configへproduct name、bundle ID、arm64、ZIP maker、temporary icon、resource allowlistを追加する。
- [x] `osxSign`、Hardened Runtime、secure timestamp、最小entitlements、`get-task-allow`禁止を設定する。
- [x] Keychain profile優先、環境変数代替の`osxNotarize`設定を追加し、credential値をlogしない。
- [x] Local acceptanceとpublic releaseのoutput／label／commandを分離する。
- [x] Node標準libraryでSHA-256、release manifest、artifact size、inclusion検査を実装する。
- [x] `npm sbom --sbom-format cyclonedx`をrelease artifact生成へ組み込む。
- [x] Fixed argvでcodesign、stapler、spctl、notary evidenceを検証し、証跡不足をfail closedにする。
- [x] ZIP 200 MiB warning／300 MiB blockingと同一version旧成果物の暗黙再利用禁止を実装する。
- [x] Credentialなしでunsigned local acceptance packageを生成し、publishable判定が失敗することをtestする。

**Story**: US-1、US-7、US-9、US-10、US-11

## Step 8: 日本語文書とRelease Checklist

- [x] Install、First Run、Workspace、Codex、VOICEVOX、Privacy、Permissions文書を作成する。
- [x] Manual Update、Rollback、Recovery文書を作成する。
- [x] Local acceptanceと一般配布禁止条件を明記する。
- [x] 新規macOS利用者プロファイルのacceptance checklistを作成する。
- [x] Gatekeeper無効化を通常導入手順として記載しない。

**Story**: US-1、US-4、US-5、US-6、US-12

## Step 9: Integrated Tests

- [x] Workspace、dependency diagnosis、release policyのexample testsを実行する。
- [x] Full PBTを通常100 runとrelease 1,000 runで実行し、seed replayを確認する。
- [x] Context-isolated Electron E2EへFirst Run、Workspace再起動復元、dependency degraded stateを追加する。
- [x] Fake codesign／notary／spctlでsuccess、failure、timeout、unknown output、secret redactionを検証する。
- [x] Fault injectionでWorkspace消失／権限拒否／partial create／checksum mismatch／package失敗を検証する。

**Story**: US-2〜US-5、US-9〜US-12

## Step 10: SummaryとFinal Verification

- [x] `aidlc-docs/construction/u10-desktop-packaging-release-readiness/code/summary.md`を作成する。
- [x] Modified／created file、story／requirement traceability、security boundary、PBT、deferred signingを記録する。
- [x] Typecheck、default tests、Studio build、Electron E2E、npm auditを実行する。
- [x] `package`／`make`でarm64 `.app`とZIPを生成する。
- [x] Package smoke、size、inclusion、SBOM、checksum、manifest、local acceptance gateを実行する。
- [x] 認証情報がないため実署名・公証を未実行として記録し、public releaseをblockingにする。
- [x] Duplicate implementation、Renderer Node access、secret、不要artifactがないことを確認する。

## Story Completion

- [x] US-1: 安全なZIP導入
- [x] US-2: 初回Workspace選択
- [x] US-3: Workspace復元
- [x] US-4: Codex診断
- [x] US-5: VOICEVOX診断
- [x] US-6: Manual update／rollback
- [x] US-7: Local acceptance artifact
- [x] US-8: Packaged production flow
- [x] US-9: Signing／notarization設定
- [x] US-10: Public distribution gate
- [x] US-11: SBOM／checksum／manifest
- [x] US-12: Reproducible release verification

## Planned Extension Compliance

- **Security**: Path boundary、typed IPC、CSP、credential provider、audit、SBOM、署名、公証、checksum、fail-closedを実装・検証する。
- **Resiliency**: Atomic state、failure containment、cleanup、manual retry、rollback、fault injection、recovery checklistを実装する。
- **PBT**: Workspace、path、manifest、inclusion、release状態をfast-checkのmodel／oracle、shrinking、seed replayで検証する。
- **適用外**: Cloud IAM／network／HA／DR、multi-user authentication、centralized monitoring。

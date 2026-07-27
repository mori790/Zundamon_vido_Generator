# U11 Code Generation計画

## この計画の位置づけ

このファイルをU11 Code Generationの単一の実行基準とする。実装時は上から順に進め、完了したstepは同じ応答内で`[x]`へ更新する。Application codeと通常docsはworkspace rootへ置き、`aidlc-docs/`にはCode Generation summaryだけを置く。

## Unit Context

- **Unit ID**: U11
- **Unit名**: Internal Adoption and Post-MVP Planning
- **Project type**: Brownfield single npm package
- **Workspace root**: `/Users/tomimorichiharu/Zundamon_vido_Generator`
- **実装範囲**: README更新、内部受入docs、Post-MVP docs、acceptance preflight command、focused tests、code summary。
- **実装しない範囲**: シリーズ管理、テンプレートライブラリ、複数Workspace管理のruntime UI/API/persistence、cloud、auto update、YouTube、完全自動Codex。

## 対象path

### 変更予定の既存ファイル

- `README.md`
- `package.json`
- `src/studio/shared/release.ts`

### 作成予定の新規ファイル

- `scripts/acceptance-preflight.ts`
- `tests/studio/acceptance-preflight.test.ts`
- `docs/internal-acceptance/clean-profile-smoke-checklist.md`
- `docs/internal-acceptance/acceptance-evidence-template.md`
- `docs/post-mvp/backlog.md`
- `docs/post-mvp/roadmap.md`
- `docs/post-mvp/series-management-spec.md`
- `docs/post-mvp/template-library-spec.md`
- `docs/post-mvp/multiple-workspaces-spec.md`
- `aidlc-docs/construction/u11-internal-adoption-and-post-mvp-planning/code/summary.md`

## Story対応

| Story | 対応step |
|---|---|
| US-1 Desktop-first README | Step 7 |
| US-2 ZIPとSHA-256照合 | Step 2, Step 4, Step 7 |
| US-3 Clean-profile smoke checklist | Step 6, Step 7 |
| US-4 受入証跡記録 | Step 6 |
| US-5 内部受入preflight | Step 2, Step 3, Step 4, Step 5 |
| US-6 Post-MVP候補比較 | Step 8 |
| US-7 シリーズ管理spec | Step 8 |
| US-8 テンプレートライブラリspec | Step 8 |
| US-9 複数Workspace管理spec | Step 8 |
| US-10 Later backlog | Step 8 |
| US-11 Future backlog | Step 8 |

## 実装計画

- [x] Step 1: 既存release成果物とscript境界を確認する。
  - [x] `scripts/release-artifacts.ts`のmanifest出力と`src/studio/shared/release.ts`のschemaを確認する。
  - [x] `package.json`に既存typecheck scriptがないため、preflightでは`npx tsc --noEmit`を使う方針を確認する。
  - [x] `out/`にartifactが存在しない場合も失敗扱いにできるよう、default pathを確認する。

- [x] Step 2: release shared helperを追加する。
  - [x] `src/studio/shared/release.ts`へ、release manifestの読み取り結果を安全に扱うpure helperを追加する。
  - [x] `local-acceptance`を`publishable`へ昇格させないsummary helperを追加する。
  - [x] 証跡pathを相対path化または伏せ字化するpure helperを追加する。

- [x] Step 3: acceptance preflight commandを追加する。
  - [x] `scripts/acceptance-preflight.ts`を作成する。
  - [x] 軽量artifact gateを先に実行し、失敗時はbuild/test gateへ進まず非0で終了する。
  - [x] artifact gate成功後、production audit、`npx tsc --noEmit`、`npm test`、`npm run studio:build`をgate単位で実行する。
  - [x] gateごとに開始、成功、失敗、証跡path、次actionを日本語で表示する。
  - [x] Workspace、`input/`、`assets/`、`audio/`、`output/`を変更しない。

- [x] Step 4: npm scriptsを追加する。
  - [x] `package.json`へ`acceptance:preflight`を追加する。
  - [x] 必要なら`typecheck` scriptを追加し、preflightとREADMEで同じ実行方法を参照できるようにする。
  - [x] 既存script名とrelease workflowを壊さない。

- [x] Step 5: focused testsを追加する。
  - [x] `tests/studio/acceptance-preflight.test.ts`を作成する。
  - [x] missing artifact、checksum mismatch、wrong architecture、wrong release state、audit/build gate failureをexample testで固定する。
  - [x] 新規pure helperに対してfast-check PBTを追加し、shrinkingとseed replayを維持する。
  - [x] 既存`tests/studio/release.property.test.ts`との重複を避ける。

- [x] Step 6: 内部受入docsを追加する。
  - [x] `docs/internal-acceptance/clean-profile-smoke-checklist.md`を作成する。
  - [x] `docs/internal-acceptance/acceptance-evidence-template.md`を作成する。
  - [x] 必須smokeと追加確認を分離する。
  - [x] VOICEVOXなし経路を開発者支援として分離する。
  - [x] Clean-profile acceptanceは実行されるまでNot Runと記録する。
  - [x] rollback evidenceとWorkspace維持方針を含める。

- [x] Step 7: READMEをDesktop-firstへ更新する。
  - [x] README冒頭を身内の非開発者向けに再構成する。
  - [x] `local-acceptance`と一般配布禁止を明記する。
  - [x] ZIP/SHA-256照合、First Run、Workspace、Codex、VOICEVOX、sample-video smokeを順に説明する。
  - [x] 内部受入docsとPost-MVP docsへリンクする。
  - [x] CLI、開発、test、release commandは後半に維持する。
  - [x] Gatekeeper無効化やquarantine削除を通常手順にしない。

- [x] Step 8: Post-MVP docsを追加する。
  - [x] `docs/post-mvp/backlog.md`に全候補、価値、依存、risk、概算規模、Roadmap区分を記録する。
  - [x] `docs/post-mvp/roadmap.md`にNext/Later/Futureと移動条件を記録する。
  - [x] `docs/post-mvp/series-management-spec.md`を作成する。
  - [x] `docs/post-mvp/template-library-spec.md`を作成する。
  - [x] `docs/post-mvp/multiple-workspaces-spec.md`を作成する。
  - [x] top-three specsにはproperty名、対象entity、generator制約、seed replay方針を含める。

- [x] Step 9: 検証を実行する。
  - [x] `npx tsc --noEmit`を実行する。
  - [x] 追加・関連testを実行する。
  - [x] `npm test`を実行する。
  - [x] 可能なら`npm run acceptance:preflight`を実行し、artifactがない場合のfail-closed挙動を確認する。

- [x] Step 10: Code Generation summaryを作成する。
  - [x] `aidlc-docs/construction/u11-internal-adoption-and-post-mvp-planning/code/summary.md`を作成する。
  - [x] 変更/作成ファイル、story対応、test結果、未実行またはdeferred項目を記録する。
  - [x] Security、Resiliency、Partial PBTの準拠summaryを記録する。

## 受入条件

- [x] READMEから非開発者がDesktop導入、ZIP照合、First Run、最小smokeへ進める。
- [x] `local-acceptance`と一般配布禁止がREADME、checklist、preflight reportで明確である。
- [x] preflightはartifact gate失敗時に早期終了し、build/test gateへ進まない。
- [x] preflightは全gate必須で、失敗時に非0で終了する。
- [x] preflight reportは秘匿情報を表示しない。
- [x] Post-MVP top-threeはspecification-onlyで、runtime codeを追加しない。
- [x] 新規pure helperはexample testと必要なPBTで検証される。

## Extension準拠

| Extension | 状態 | 計画上の対応 |
|---|---|---|
| Security Baseline | Compliant | checksum、SBOM、production audit、secret-safe report、unsafe install guidance禁止、release-state separationを実装する。 |
| Resiliency Baseline | Compliant | fail-closed、non-destructive rerun、rollback evidence、Not Run preservation、direct/in-place前提を文書とpreflightへ反映する。 |
| Property-Based Testing (Partial) | Compliant | 新規pure helperだけPBT必須。fast-check、shrinking、seed replayを維持し、主要failure pathはexample testで固定する。 |

## 承認

この計画を承認すると、上記Step 1から順にアプリコード、README、docs、testsを変更する。

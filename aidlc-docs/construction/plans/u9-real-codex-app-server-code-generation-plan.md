# Code Generation Plan: U9 Real Codex App Server Integration

このplanはU9 Code Generationのsingle source of truthである。各step完了直後、同じinteractionでcheckboxを `[x]` に更新する。

## Unit Context

- **Stories**: US-3、US-4、US-5、US-8。
- **Dependencies**: U1 Electron shell、U2 Codex panel/Mock/history、U4 proposal approval、U6 operation/log patterns。
- **External runtime**: User-installed Codex CLI 0.145.0+、existing ChatGPT login。
- **Transport**: Stable JSONL-over-stdio only。
- **Security boundary**: Electron main owns process/files; Renderer uses context-isolated typed APIs。
- **Out of scope**: WebSocket、experimental APIs、multiple thread UI、remote auth、U10 packaging。

## Step 1: Baseline and PBT Dependency

- [x] 変更直前に `package.json`、`package-lock.json`、current tests/build resultsを再確認する。
- [x] `fast-check@4.9.0` をexact devDependencyとして追加する。
- [x] PBT seed/path replayをdefault Vitest outputで確認する。
- [x] `npx tsc --noEmit` とcurrent default testsを実行する。

## Step 2: Shared Codex Contracts and Pure State

- [x] `src/studio/shared/codex-app-server.ts` にpurpose-specific IPC requests、events、connection/turn/item/approval state、limits、runtime validationを追加する。
- [x] Existing `src/studio/shared/chat.ts` の`CodexConnection`をbackward-compatibleなstreaming/reconnect capabilityで拡張する。
- [x] JSONL serialization/parsing、turn transition、approval exactly-onceをpure logicとして実装する。
- [x] Example testsを `tests/studio/codex-app-server.test.ts` に追加する。
- [x] Round-trip、bounds、terminal monotonicity、approval stateful modelを `tests/studio/codex-app-server.property.test.ts` に追加する。
- [x] PBT-02〜08、10のapplicable assertions、domain generators、shrinking、seed replayを検証する。

## Step 3: Main App Server Service

- [x] `src/studio/main/codex-app-server-service.ts` にsingle process、initialize、thread start/resume、turn start/interrupt、request correlationを実装する。
- [x] 5s start、10s initialize、10min turn、128 pending requests、1 MiB line、3 bounded reconnect delaysを実装する。
- [x] Reconnectはin-flight turnを再送せず、3 failure後はmanual half-openだけを許可する。
- [x] Workspace sessionを `generated/studio/{videoId}/codex-session.json` へvalidated atomic writeする。
- [x] Pending approvalを5分timeout、unknown/disconnect/shutdown default deny、exactly-once responseで実装する。
- [x] 2,000-entry redacted diagnostic ringを実装する。
- [x] Fake process、clock、filesystemをinjected boundariesとしてexample/fault-injection testsを追加する。

## Step 4: Hardened Local File Boundary

- [x] `src/studio/shared/local-file.ts` にWorkspace、script、asset、chat history用purpose-specific API typesを追加する。
- [x] `src/studio/main/local-file-service.ts` にcanonical filesystem operationsを移す。
- [x] `workspace-client.ts`、`script-file-access.ts`、`asset-file-access.ts`、`chat-history-store.ts`、renderer bootstrapをtyped API clientへ移行する。
- [x] Rendererの`window.require`、Node builtin、direct Electron accessを全て除去する。
- [x] Existing workspace、script、asset、chat testsをmain service/client boundaryへ適合する。
- [x] Asset Electron E2Eをcontext-isolated preload pathで維持する。

## Step 5: Context-Isolated IPC and Preload

- [x] `src/studio/main/main.ts` にLocal FileとCodexのvalidated IPC handlersを登録する。
- [x] `src/studio/main/preload.ts` を`contextBridge.exposeInMainWorld`へ変更する。
- [x] BrowserWindowを`contextIsolation: true`、`nodeIntegration: false`へ変更する。
- [x] Rendererへgeneric JSON-RPC、raw path、process handle、credentialを公開しない。
- [x] Event subscriptionsがunsubscribeし、window/app shutdownでservice cleanupすることをtestする。

## Step 6: Real Renderer Adapter

- [x] `src/studio/renderer/real-codex-connection.ts` にtyped Codex API adapterを追加する。
- [x] 50ms delta batching、completion/terminal immediate flush、item-order persistenceを実装する。
- [x] Resume failure、start-new-thread、manual reconnect、Stop、stale Workspace event dropを実装する。
- [x] Failed/interrupted partial textをtransient `未完了` stateとして保持し、historyへ保存しない。
- [x] Adapter testsでstream ordering、batch flush、failure、cleanupを検証する。

## Step 7: Codex Panel and Studio Integration

- [x] `CodexPanel.tsx` にdefault Real、explicit Mock selector、stream status、Stop/reconnect/new-thread actionsを追加する。
- [x] Dedicated Pending Approval cardをexisting proposal visual patternで追加し、state schemaは分離する。
- [x] Active turn中はSend disabled、connection/turn/approval stateをaccessible textで表示する。
- [x] `StudioApp.tsx` でWorkspace switch時にinterrupt/terminal/unsubscribe/connectをsequenceする。
- [x] Existing JSON proposal extractionとapproval flowをcompleted real assistant itemに適用する。
- [x] Component testsでReal/Mock source、stream、approval deny/approve、resume failure、manual recoveryを検証する。

## Step 8: Sequential Supply-Chain Upgrade

- [x] Electronを41.7.1へexact upgradeし、typecheck、main/preload/E2E tests、Studio buildを実行する。
- [x] Viteを6.4.3へexact upgradeし、typecheck、Renderer tests、Studio buildを実行する。
- [x] Vitestを4.1.10へexact upgradeし、full example/PBT suiteとStudio buildを実行する。
- [x] Related peer dependency incompatibilityだけを最小調整する。
- [x] `npm audit`を再実行し、production high/criticalを解消またはnon-reachability evidenceで評価する。
- [x] Force audit fixは使用しない。

## Step 9: Documentation

- [x] `aidlc-docs/construction/u9-real-codex-app-server/code/summary.md` を生成する。
- [x] Story/requirement traceability、changed files、protocol scope、security boundary、PBT、limitationsを記録する。
- [x] Build/Test instructionsへPBT replay、fault injection、real App Server smoke、recovery checklistを追加する。
- [x] Extension complianceをrule ID単位で記録する。

## Step 10: Final Verification

- [x] `npx tsc --noEmit` を実行する。
- [x] U9 targeted example testsとproperty testsを実行する。
- [x] Full default testsを実行する。
- [x] `npm run studio:build` を実行する。
- [x] Context isolation下のElectron E2Eを実行する。
- [x] Current Codex loginでconnect、thread start/resume、stream、Stopをmanual smokeする。
- [x] Approval requestを発生できるsafe promptでapprove/deny、timeout/disconnect default denyを確認する。
- [x] Process exit、malformed/oversized line、capacity、3 reconnect failure、manual half-open recoveryをfault-injection testする。
- [x] Existing Mock、draft、asset、command、Preview、Render、CLI regressionsがないことを確認する。
- [x] `npm audit` gateを最終評価する。
- [x] Duplicate files、raw Renderer Node access、unexpected experimental API usageがないことを確認する。

## Story Completion

- [x] US-3: Real streamed Workspace conversation。
- [x] US-4: Authentication/connection failure and manual recovery。
- [x] US-5: Real assistant completed items feed JSON draft extraction。
- [x] US-8: Server mutation requests require explicit fail-closed approval。
- [x] All plan checkboxes、example tests、full PBT、build、audit、manual smoke are complete。

## Planned Extension Compliance

### Security

- SECURITY-03、05、06、08〜13、15をcode/testへ実装する。
- SECURITY-10はsequential upgrades、lockfile、audit gateでenforceする。
- SECURITY-01、02、04、07、14はlocal non-networked toolとしてN/A。

### Resiliency

- RESILIENCY-01〜04、10、14、15をbounded retry、fault injection、recovery checklistへ実装する。
- RESILIENCY-05〜09、11〜13はlocal non-deployed toolとしてN/A。

### Property-Based Testing

- PBT-01 propertiesをPBT-02〜08、10のtestsへ実装する。
- PBT-09は`fast-check@4.9.0` exact dependencyで満たす。

# NFR Design Patterns: U9 Real Codex App Server Integration

## Main-Process Isolation

- App Server process、raw JSONL、filesystem、credential environmentはElectron main processだけが扱う。
- Rendererはcontext-isolated、Node-disabledで、purpose-specific Context Bridge APIだけを使用する。
- Main processは全IPC payloadを再validateする。

## Non-Replaying Retry

- Unexpected process exit後のretryはconnectionとinitializeだけを対象にする。
- In-flight turnはfailed/interruptedとしてterminal化し、自動再送しない。
- Retry delaysは500 ms、1 second、2 seconds。
- Retry中に新しいturnを受理しない。

## Manual Half-Open Circuit

- 3回失敗後はcircuitをopenにしてautomatic retryを停止する。
- Manual reconnectだけがhalf-open probeを開始する。
- Probe successでclosed、failureでopenへ戻る。
- Mock modeへautomatic fallbackしない。

## Bounded Bulkhead and Backpressure

- Pending request mapは128 entries。
- Capacity到達時はnew requestを`capacity-exceeded`でrejectし、既存requestを保持する。
- JSONL、prompt、assistant item、logs、historyに独立したsize limitsを持つ。
- No waiting queue。1 active turn ruleを維持する。

## Stream Batching

- Agent deltaはitem IDごとにmemory bufferへappendする。
- Renderer updateは50 ms intervalでbatchする。
- Item completion、turn terminal、errorはtimerをcancelして即時flushする。
- Failed/interrupted partial itemはtransient `未完了` stateでcanonical historyへ保存しない。

## Fail-Closed Approval

- Server requestはrecognized stable schemaだけをPending Approvalへ変換する。
- Approval Controllerはpendingからapproved/denied/expiredへのfirst terminal transitionだけを採用する。
- Unknown、malformed、timeout、disconnect、window close、shutdownはdeny。
- Protocol response送信失敗でもUIでapproved successとして表示しない。

## Safe Persistence

- Thread sessionとchat historyはseparate schema/file。
- Session writeはbounded validated dataだけをatomic replacementする。
- Resume failureはsessionを自動削除せず、explicit start-new-threadで置換する。
- Rendererにabsolute pathやraw filesystem APIを公開しない。

## Redacted Diagnostics

- In-memory ring bufferは2,000 entries。
- Entryはtimestamp、level、event code、correlation ID、safe metadataだけを保持する。
- Prompt、assistant text、credential、environment、raw requestはlogしない。
- Application shutdownで破棄する。

## Sequential Security Upgrade

1. Electronをsecurity-supported versionへupgradeしてtypecheck、main/preload tests、Studio buildを実行する。
2. ViteをupgradeしてRenderer testsとStudio buildを実行する。
3. Vitestをupgradeしてfull testsとPBT integrationを実行する。
4. `npm audit`を再実行し、production high/critical gateを評価する。

一括force fixは使用しない。

## Property-Based Testing Pattern

- `fast-check`のdomain generatorsをprotocol request、response、notification、session、approval commandへ提供する。
- Shrinkingを無効化しない。
- Default runはrandom seedを使用し、failure outputへseedとpathを表示する。
- Replay commandをBuild instructionsへ記録する。
- Stateful command modelでApproval ControllerとTurn reducerをreference stateと比較する。
- PBT-discovered shrunk failureはexample regression testへ追加する。

## Resiliency Testing Pattern

- Reference: `aidlc-docs/construction/build-and-test/` manual smoke-test and audit workflow。
- U9 additions:
  - Process exits during initialize。
  - Process exits during active turn without turn replay。
  - Malformed and oversized JSONL。
  - 128 pending request capacity。
  - Approval timeout/disconnect/shutdown deny。
  - Three reconnect failures and manual half-open recovery。
  - Resume failure and explicit new-thread recovery。
- Releaseごとにautomated fault-injection testsとmanual real-App-Server recovery checklistを記録する。

## Extension Compliance

### Security

- **Compliant design**: SECURITY-03、05、06、08〜13、15。
- **SECURITY-10**: Sequential upgrade and audit gate designed。
- **N/A**: SECURITY-01、02、04、07、14。
- **Blocking findings**: なし。

### Resiliency

- **Compliant**: RESILIENCY-01〜04、10、14、15。
- **RESILIENCY-14 reference**: Existing build-and-test manual smoke/audit workflow。
- **N/A**: RESILIENCY-05〜09、11〜13。
- **Blocking findings**: なし。

### Property-Based Testing

- **Compliant by design**: PBT-01〜10。Properties、fast-check、domain generators、shrinking、random seed replay、stateful model、example complementsを設計した。
- **Blocking findings**: なし。

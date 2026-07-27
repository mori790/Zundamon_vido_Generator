# Business Rules: U9 Real Codex App Server Integration

## Connection Rules

- BR-1: Real modeはdefault、Mock modeは明示選択時だけ使用する。
- BR-2: Connectはvalidated active videoIdを必須とする。
- BR-3: Requestはinitialize completion前に送信しない。
- BR-4: Codex executable、auth、handshake failureを異なるsafe error codeで表示する。
- BR-5: Automatic Mock fallbackは禁止する。

## Thread Rules

- BR-6: Session fileにthread IDがあればresumeを試みる。
- BR-7: Resume失敗時はsession IDを自動削除・置換しない。
- BR-8: Userが「新しいthreadを開始」を明示した場合だけold sessionを置換する。
- BR-9: Active videoIdとsession videoIdが一致しないturn startを拒否する。

## Turn Rules

- BR-10: 1 connectionのactive turnは高々1件。
- BR-11: Active turn中はSendをdisabledにし、queueやsteerを行わない。
- BR-12: Workspace切替時はcurrent turnをinterruptし、terminalを確認してからsubscriptionを解除する。
- BR-13: Old Workspace eventはgeneration/videoId checkでdropする。
- BR-14: Completed assistant itemをitem単位、event順にchat historyへ保存する。
- BR-15: Failed/interrupted turnのpartial textは`未完了`表示のみでcanonical historyへ保存しない。

## Approval Rules

- BR-16: Recognized mutation requestだけをPending Approvalとして表示する。
- BR-17: User approve/deny、timeout、disconnect、shutdownの最初のterminal eventだけを採用する。
- BR-18: UI破棄、unknown request、malformed request、duplicate responseはdeny/fail closed。
- BR-19: Raw request payload、credential、unbounded command textをRendererへ渡さない。

## Persistence Rules

- BR-20: Thread sessionとchat historyはseparate schema/file。
- BR-21: Deltaごとのfilesystem writeは禁止。
- BR-22: Session/chat writeはmain processのvalidated canonical pathだけを使用する。
- BR-23: Invalid、missing、oversized persisted dataはexecution inputとして使用しない。

## Validation Rules

- All IPC and protocol strings have explicit byte/character limits。
- videoId uses existing allowlist validation。
- Request IDs、thread IDs、turn IDs、item IDs、approval IDs use bounded schema。
- Unknown notifications are ignored with safe diagnostic metadata; unknown server requests receive generic deny。

## Story Traceability

- US-3: Real in-workspace conversation and streamed response。
- US-4: Authentication、connection failure、manual operation continuity。
- US-5: Completed assistant messages continue existing JSON proposal extraction。
- US-8: App Server mutations require dedicated explicit approval。

## Extension Compliance

### Security

- **Compliant**: SECURITY-05、06、08、09、11、12、13、15。Bounded validation、main-process authority、explicit approval、credential isolation、safe parsing、fail-closed transitions、cleanupをrulesへ定義した。
- **Planned downstream**: SECURITY-03 local structured logging、SECURITY-10 dependency audit/schema version verification。
- **N/A**: SECURITY-01、02、04、07、14。Network/cloud/HTTP endpointなし。
- **Blocking findings**: なし。

### Resiliency

- **Compliant**: RESILIENCY-01〜04、10、15。Low-critical local workload decision、change/rollback、bounded dependency failure、lightweight incident handlingを維持した。
- **N/A**: RESILIENCY-05〜09、11〜14。Deployed service、cloud HA、DRなし。
- **Blocking findings**: なし。

### Property-Based Testing

- **Compliant**: PBT-01。Domain entitiesとbusiness logicにround-trip、invariant、stateful propertiesをcomponent別に定義した。
- **Applicable downstream**: PBT-02〜10。
- **Blocking findings**: なし。

# NFR Design Patterns: U8 Render Workflow and CLI Compatibility Verification

## Single Job with Internal Frame Concurrency

Final clarification answer A supersedes the earlier application-level worker-pool interpretation.

- Application-levelではU6 Command Runnerによる同時Render 1件を維持する。
- 単一Render内のframe処理はRemotion `renderMedia` のexisting `concurrency` optionへ委譲する。
- 複数videoId queue、persistent queue、new worker frameworkは追加しない。
- 4K/60fps/30分capacityはRemotion internal workersで処理し、hardware別の完了時間は保証しない。

## Structured Progress Through Existing Operation

`Operation` にoptional Render progressを追加する。

- `renderedFrames`
- `totalFrames`
- `fraction`
- `etaSeconds`

Render ServiceはRemotion callbackを受け、単調増加、0から1へのclamp、throttle、ETAを計算する。CLI scriptは固定prefixのstructured progress lineをstdoutへ出し、U6 Command RunnerがparseしてOperationを更新する。Rendererはexisting operation eventsとsnapshotを再利用し、専用progress IPCを追加しない。

Final 100%はthrottle windowに関係なく通知する。Renderer reconnect後はCommandSnapshot内のlatest Operationからprogressを復元する。

## ETA Calculation

- Progressが0、elapsed sampleが不足、またはRender完了時はETAを省略する。
- `elapsed * (1 - fraction) / fraction` を基本式とする。
- Negative、non-finite、過去値より不自然に増える値は表示用に正規化できる。
- ETAは目安として表示し、completion guaranteeには使用しない。

## Render Gate State Machine

GUI Renderは次の順序で進む。

1. `checkPreview(videoId)` でscript、manifest、timeline readinessを確認する。
2. Blockedなら必要なVoiceまたはTimelineを表示して終了する。
3. RenderOutputServiceでcanonical output statusを確認する。
4. Existing outputがある場合、Electron native message boxで上書きを確認する。
5. Confirm後だけU6 Render operationを開始する。
6. Process exit 0後、Command Runner postflightがnon-zero outputを検証する。
7. Verification success後だけOperationをsucceededにする。

CLIはGUI overwrite gateを通さずexisting behaviorを維持する。

## Postflight Output Verification

Render commandだけにpostflightを追加する。

- Existing path resolverでcanonical outputを解決する。
- `stat` でregular fileかつsizeが0より大きいことを確認する。
- FailureならOperationを `failed`、failureを `output-verification-failed` とする。
- Partial outputを削除、移動、renameしない。
- Warningとcanonical pathをsystem logへ追加する。

## Native Confirmation and Reveal

- Electron main processがnative message boxを表示する。
- InputはvideoIdだけで、dialog messageのpathはmain processが解決する。
- Cancelではcommandを開始しない。
- Success後のrevealはElectron `shell.showItemInFolder` を使用する。
- Reveal前にもnon-zero outputを確認し、arbitrary path IPCを受け付けない。

Native dialogのkeyboard、focus、accessible nameはplatform accessibilityへ委譲する。Dialog終了後はRender buttonへfocusを戻す。

## Partial Output Recovery

- Stop、command failure、postflight failureでpartial outputを自動削除しない。
- Operation terminal stateとwarningを表示する。
- 次回Render時はexisting outputとして上書き確認する。
- Automatic retry、automatic repair、background cleanupは行わない。

## CLI Compatibility Test Boundary

- Automated testsはallowlisted command mapping、arguments、canonical paths、schema/format、progress parsing、postflight verificationを対象にする。
- Actual VOICEVOX、Remotion Studio、MP4 encoding、native file managerはmanual integrationへ分離する。
- `sample-video` をGUIとCLI共通fixtureとして使用する。

## Extension Compliance

- Security Baseline: N/A。無効。ただしvideoId-only OS boundaryを維持する。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。


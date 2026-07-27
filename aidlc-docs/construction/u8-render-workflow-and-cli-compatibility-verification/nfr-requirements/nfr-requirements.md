# NFR Requirements: U8 Render Workflow and CLI Compatibility Verification

## Performance and Responsiveness

- Render processはElectron Renderer外で非同期実行し、GUI event loopをblockしない。
- Render開始後、running statusを即時表示する。
- Frame進捗からpercentと推定残り時間を継続表示する。
- Progress表示は単調増加とし、0%から100%の範囲へ制限する。
- 過剰なRenderer更新を避けるため、progress通知は最大で毎秒数回へthrottleできる。
- LogsはRender中も順序を維持してstream表示する。

## Capacity

- MVP保証範囲は3840x2160、60fps、最大30分とする。
- 1 Workspaceにつき同時Renderは1件だけとする。
- 複数Render queueとbackground batch renderは対象外。
- 保証範囲は入力受理とworkflowの正しさを表し、特定hardware上の完了時間を保証しない。
- Disk空き容量やmachine resource不足は明確なfailureとして表示する。

## Reliability

- U6 process exit successに加え、`output/{videoId}.mp4` が存在しsizeが0より大きい場合だけGUI successとする。
- Output verification failureはRender failureとしてtext表示する。
- Stopまたはfailureでpartial MP4が残っても自動削除しない。
- Partial outputの可能性をwarningし、次回Render前の上書き確認対象とする。
- 自動retry、自動repair、partial file移動は行わない。
- Operation status、progress、logs、output resultは同じoperation IDへ関連付ける。

## Security and File Safety

- Rendererから受け付ける識別子は検証済みvideoIdと固定operationだけとする。
- Output pathは `output/{videoId}.mp4` からmain process側で解決し、任意pathを受け付けない。
- Native file revealはcanonical outputだけへ制限する。
- Existing outputの上書きはGUIで明示確認を要求する。
- Stopまたはfailure時のpartial fileを自動削除せず、意図しないdata lossを避ける。
- Project data、logs、render outputを外部serviceへ送信しない。

## CLI Compatibility and Maintainability

- Existing npm scripts、arguments、VideoScript schema、directory layoutを維持する。
- `validate`、`voice`、`timeline`、`preview`、`render` のcommand invocation、path、format compatibilityを自動テストする。
- VOICEVOX、実Remotion playback、実MP4 Renderはmanual integration testで確認する。
- GUI-specific stateをcanonical script、manifest、timelineへ追加しない。
- Render progressはexisting Remotion rendererのprogress callbackを再利用し、独自frame schedulerを作らない。
- U6 operation/log boundaryを拡張し、別のRender process runnerを追加しない。

## Usability and Accessibility

- Overwrite confirmationはkeyboardで操作でき、initial focusとclose後のfocus returnを管理する。
- Dialogにaccessible nameと明確なoutput pathを表示する。
- Ready、blocked、running、progress、succeeded、failed、cancelledを色だけでなくtext表示する。
- Percentと推定残り時間にはaccessible textを提供する。
- Finder actionはoutput verification後だけ有効にする。
- macOSではFinder、他platformでは対応するnative file managerへ表示する。

## Availability and Operations

- Local desktop applicationのためuptime、failover、multi-region、disaster recoveryはN/A。
- External runtime failureはoperation logsとrecovery hintで識別する。
- Monitoring serviceやtelemetryは追加しない。
- Long-running Renderは利用者がStopでき、terminal stateへ遷移する。

## Verification

- Automated: readiness gate、overwrite gate、progress calculation/throttling、output existence/size、canonical path、native reveal delegation、command compatibility。
- Default suiteはVOICEVOX、actual playback、actual MP4 encodingを実行しない。
- Manual: `sample-video` で全CLI commands、4K/60fps/30分capacity boundary、actual Render、progress/ETA、Stop、partial warning、Finder revealを確認する。
- Environment failureとformat/path incompatibilityを別々に記録する。

## Traceability

- US-2: CLI compatibility、canonical formats and paths。
- US-16: Responsive Render、progress、verified output、native reveal。
- US-17: Streaming logs、operation-linked progress、terminal status。
- US-19: Failure logs、partial warning、manual retry。
- NFR-1: Local-only execution。
- NFR-3: Non-blocking GUI and progress。
- NFR-4: Existing pipeline reuse。
- NFR-5: Overwrite approval and canonical paths。
- NFR-6: Automated boundary tests plus manual media integration。

## Extension Compliance

- Security Baseline: N/A。無効。ただしcanonical pathとallowlistを維持する。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。


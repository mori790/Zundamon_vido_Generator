# Tech Stack Decisions: U8 Render Workflow and CLI Compatibility Verification

## Render Execution

Existing U6 Command Runnerと `npm run render -- {videoId}` を再利用する。

- Rendererからshell commandを組み立てない。
- Single-operation、Stop、stdout/stderr streamingを維持する。
- U8専用process runnerやrender queueを追加しない。
- Clarificationにより、単一Render内ではRemotion existing `concurrency` optionによるinternal frame workersを使用する。Application-level worker poolは追加しない。

## Progress and ETA

Existing `@remotion/renderer` の `renderMedia` progress callbackを使用する。

- Completed framesとtotal framesからpercentを計算する。
- Elapsed timeとprogressから推定残り時間を計算する。
- Progress 0またはsample不足時はETAを表示しない。
- Renderer更新はthrottleし、final 100%は必ず通知する。
- 独自frame schedulerや追加dependencyを採用しない。

## Output Verification

Node.js filesystem APIでcanonical outputを確認する。

- Existing path resolverで `output/{videoId}.mp4` を解決する。
- `stat` でregular file、存在、sizeが0より大きいことを確認する。
- MP4 parserやmedia probe dependencyは追加しない。

## Native File Reveal

Electron `shell.showItemInFolder` をmain process側の狭いboundaryで使用する。

- InputはvideoIdだけとする。
- Main processがcanonical output pathを解決する。
- macOS Finderと他OSのnative file managerをElectronへ委譲する。
- Arbitrary path IPCを追加しない。

## Readiness and Overwrite Gate

U7 PreviewDataServiceのsource/readiness logicとNode.js file existence checkを再利用する。

- Missing/stale artifact判定をRender UIで再実装しない。
- Existing output確認はcanonical pathだけへ限定する。
- ConfirmationはGUI-only gateであり、existing CLI behaviorを変更しない。

## Testing

Vitestと既存mock boundariesを使用する。

- Pure tests: progress、ETA、output verification、readiness decision。
- Component tests: overwrite dialog、blocked state、success path、Finder action、failure state。
- Integration tests: U6 operation lifecycleと全allowlisted CLI command mapping。
- Manual tests: VOICEVOX、Remotion Studio、actual MP4 encoding、native Finder。

## Rejected Alternatives

- New application-level Render worker framework: Existing child-process runnerとRemotion internal concurrencyで足りるため不採用。
- MP4 metadata dependency: Non-zero canonical output checkでMVP要件を満たすため不採用。
- Automatic partial cleanup: Data loss riskとexisting CLI behavior差分を増やすため不採用。
- Default suiteでactual 4K Render: Runtimeとexternal dependencyが大きいため不採用。

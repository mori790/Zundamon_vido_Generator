# Logical Components: U8 Render Workflow and CLI Compatibility Verification

## RenderWorkflow

Workspace内のGUI Render coordinator。

### Responsibilities

- U7 PreviewDataServiceのreadinessを確認する。
- RenderOutputServiceからoutput statusを取得する。
- Existing output時にnative overwrite confirmationを要求する。
- Confirm後にU6 Renderを開始する。
- Operation progress、terminal status、output resultをProduction Panelへ渡す。
- Workspace変更またはunmountでlocal stateを破棄する。

## RenderOutputService

Electron main processのvideoId-only output boundary。

### API

- `status(videoId)`: canonical path、exists、nonZeroを返す。
- `confirmOverwrite(videoId)`: Existing output時にnative message boxを表示する。
- `reveal(videoId)`: Verified outputをnative file managerで表示する。
- `verify(videoId)`: regular non-zero canonical outputを検証する。

### Constraints

- Existing `validateVideoId` と `resolveOutputPath` を再利用する。
- Rendererからpath、URL、shell commandを受け付けない。
- Failure/Stop時にoutputを削除しない。

## RenderProgressAdapter

Existing Render Service内の小さなadapter。

### Responsibilities

- Remotion `renderMedia` callbackを受け取る。
- Fractionとframe countsを正規化する。
- ETAを計算する。
- 更新をthrottleし、final 100%を保証する。
- CLI scriptへstructured progress recordを渡す。

追加dependency、cache、persistent stateを持たない。

## CommandRunner Progress Parser

U6 Command Runnerのstdout boundaryを最小拡張する。

- Fixed prefix付きprogress recordだけをparseする。
- videoId、operation ID、numeric rangesを現在のoperationへ関連付ける。
- Valid progressでOperation fieldsを更新し、existing operation eventをemitする。
- Malformed recordはcrashせず通常logまたはwarningとして扱う。
- Snapshotはlatest progressを含む。

## Render Postflight

Render child processがexit 0を返した後、RenderOutputServiceのverifyを実行する。

- Verification中はterminal successをemitしない。
- Successなら100% progress付きsucceededをemitする。
- Failureならoutput verification failureとpartial warningを含むfailedをemitする。
- Validate、Voice、Timeline、Preview commandには適用しない。

## NativeOverwriteDialog

Electron native message boxを使用するmain-process component。

- Existing canonical output pathを表示する。
- ConfirmまたはCancelを返す。
- Dialog keyboard behaviorとfocusをnative platformへ委譲する。
- Rendererはconfirmation resultだけを受け取る。

## ProductionCommandPanel Integration

- Existing Render buttonをRenderWorkflow gateへ接続する。
- Existing status、Stop、logsを維持する。
- Render中はpercentとETAをtext表示する。
- Success時はcanonical output pathと「Finderで表示」を表示する。
- Failure時はexisting logsとpartial output warningを表示する。
- Retry専用buttonを追加せず、existing Render buttonを使用する。

## Frame Worker Concurrency

- Application-level render jobsは同時1件。
- Remotion internal concurrencyだけを使用する。
- Concurrency値はRemotion supported optionとしてRenderOptionsから渡せる。
- App-level worker process pool、multi-video queue、persistent schedulerは存在しない。

## Test Components

- Pure progress tests: clamp、monotonicity、throttle、ETA、final update。
- Output service tests: missing、zero-byte、non-zero、unsafe videoId、reveal。
- Runner tests: valid/malformed progress、snapshot、postflight success/failure、Stop。
- UI tests: blocked readiness、native confirmation result、progress text、success reveal、partial warning。
- CLI compatibility tests: all five existing command mappings and canonical paths。
- Manual: actual 4K/60fps Render、VOICEVOX、Preview、Stop、partial output、native Finder。

## Traceability

- US-2: Command mapping、canonical files、compatibility tests。
- US-16: RenderWorkflow、progress、verified output、reveal。
- US-17: Operation progress、snapshot、logs、terminal status。
- US-19: Postflight failure、partial warning、manual retry。


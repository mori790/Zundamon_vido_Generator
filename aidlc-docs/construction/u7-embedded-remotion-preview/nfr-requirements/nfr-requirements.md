# NFR Requirements: U7 Embedded Remotion Preview

## Performance

- 生成済みartifactが揃っている場合、Preview操作からPlayer表示開始まで5秒以内を目標とする。
- checking、generating、loadingの各状態を即時にtext表示する。
- source更新確認はPreview open/refreshとU3/U6成功イベント時だけ行い、常時pollingやfilesystem watcherを使わない。
- U6成功イベントが連続した場合、同一videoIdの不要な重複reloadを抑止する。

## Capacity

- MVP保証範囲は1920x1080、30fps、最大30分。
- Workspaceごとにembedded Playerは1つだけとする。
- 複数Preview tabと複数同時Playerはサポートしない。
- Workspace closeまたはvideoId変更時にPlayer、composition props、event listenerを解放する。
- 30分を超える動画や設定上限を超える解像度・fpsはbest effortとし、保証範囲外であることを表示する。

## Reliability

- Preview readiness判定は不足artifact、stale artifact、load failureを区別する。
- 自動Voice/Timeline生成はU6の単一実行制御と失敗状態を再利用する。
- reload失敗時は直前の表示を可能な限り保持し、stale/errorを明示する。
- Embedded Player初期化失敗時は手動のRemotion Studio fallbackを提供する。
- fallbackを自動起動せず、利用者操作を要求する。

## Security

- Rendererは検証済みvideoIdだけをlocal preview APIへ渡す。
- 任意filesystem path、任意URL、任意commandを受け付けない。
- composition propsは既存schemaとrender-data境界を通したlocal project dataだけを使用する。
- Remote contentとcloud uploadはU7対象外。
- Security Baselineは無効だが、U6 allowlistとlocal file境界を維持する。

## Maintainability

- 既存 `ZundamonVideo` compositionと `ZundamonCompositionProps` をembedded Playerでも再利用する。
- Remotion Studio用compositionを複製しない。
- readiness/stale判定をUIから分離した純粋ロジックとして自動テストする。
- Player UIはRemotion Playerをmockして状態、操作、fallbackを自動テストする。
- 実映像・音声、fullscreen、playback qualityはmanual smoke testで確認する。

## Usability and Accessibility

- keyboardでPlay/Pause、seek、volume、fullscreen、fallbackを操作可能にする。
- すべての操作にaccessible nameとvisible focusを付ける。
- 状態とerrorは色だけでなくtextで表示する。
- loading/generating中に無効な操作はdisabled状態と理由を示す。
- seek controlは現在時間またはframeと総時間を読み取れるlabelを持つ。

## Availability and Operations

- Local desktop applicationのためuptime、multi-region、disaster recoveryはN/A。
- VOICEVOX、filesystem、Remotion initializationの失敗は利用者が再試行可能な状態へ戻す。
- Cloud monitoringとalertingは不要。U6 Log Panelを診断情報のsingle source of truthとする。

## Verification

- 5秒目標は生成済みsample videoを用いたmanual timingで確認する。
- 1920x1080、30fps sampleでPlayer表示と基本操作を確認する。
- pure logicとUI testsをdefault test suiteへ含める。
- 実映像・音声のsmoke testは環境依存のためdefault test suiteへ含めない。

## Extension Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。


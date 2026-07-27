# Business Rules: U8 Render Workflow and CLI Compatibility Verification

## Render Preconditions

- Render対象はApply済み `input/{videoId}.json` とする。
- 未Apply draftを直接Renderしない。
- Script、manifest、timelineが揃い、staleでない場合だけGUIからRenderを開始できる。
- Missingまたはstale artifactをU8が自動生成しない。
- Block理由と必要なVoiceまたはTimeline操作をtextで表示する。

## Overwrite Rules

- Canonical outputは `output/{videoId}.mp4` とする。
- Existing outputがある場合、GUIは上書き確認を必須とする。
- Cancel時はU6 Render operationを開始しない。
- GUI確認の追加によってCLIの既存上書きbehaviorを変更しない。
- Timestamp付きcopyやoutput historyは作成しない。

## Operation Rules

- Render execution、single-operation制御、Stop、logs、terminal statusはU6をsingle source of truthとする。
- 任意command、任意output path、shell文字列をRendererから渡さない。
- Render成功時だけoutput pathとFinder actionを表示する。
- Failure時は既存logsを保持し、自動retryしない。
- Retryは利用者が既存Render buttonを再度選択した場合だけ開始する。

## Finder Rules

- Finder actionはcanonical output pathだけを対象とする。
- Outputが存在しない場合はFinder actionを無効化し、missing resultを表示する。
- Rendererから任意filesystem pathをOS integration boundaryへ渡さない。

## CLI Compatibility Rules

- Existing npm scripts、arguments、directory layout、VideoScript schemaを変更しない。
- GUI-created scriptとassetsはCLIがそのまま読める形式で保存する。
- Verification対象は `validate`、`voice`、`timeline`、`preview`、`render` とする。
- Existing `sample-video` を共通verification projectとする。
- VOICEVOXやRemotion Studioなど外部runtimeが停止中の場合はenvironmental failureとして記録し、format incompatibilityと混同しない。

## Extension Compliance

- Security Baseline: N/A。無効。ただしvideoId、allowlisted command、canonical output pathの境界を維持する。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。


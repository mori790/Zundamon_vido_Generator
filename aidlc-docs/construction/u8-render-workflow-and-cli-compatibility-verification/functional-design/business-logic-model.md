# Business Logic Model: U8 Render Workflow and CLI Compatibility Verification

## Scope

U8はApply済みprojectを既存U6 Render operationでMP4へ変換し、結果pathまたはfailure logsをGUIへ表示する。同じproject filesとcommandsをCLIから引き続き利用できることを検証する。

## Start Render Flow

1. Current WorkspaceのvideoIdを取得する。
2. Apply済みscript、manifest、timelineのreadinessを確認する。
3. Artifactがmissingまたはstaleの場合はRenderを開始せず、不足項目と必要なVoiceまたはTimeline操作を表示する。
4. `output/{videoId}.mp4` の存在を確認する。
5. Existing outputがある場合はGUIで上書き確認を表示する。
6. 利用者が承認した場合だけU6 `render` operationを開始する。
7. U6のoperation stateとordered logsをProduction Panelへ表示する。

## Render Success Flow

1. U6 terminal status `succeeded` を受け取る。
2. Canonical output path `output/{videoId}.mp4` を表示する。
3. 「Finderで表示」操作を有効にする。
4. Current Workspaceのrender resultをsuccessとして保持する。

## Render Failure Flow

1. U6 terminal status `failed` または `cancelled` を受け取る。
2. Error、phase、関連logsを既存Production Panelへ表示する。
3. 専用の自動修復や自動再実行は行わない。
4. 利用者は原因を修正後、既存Render buttonから再実行する。
5. Codexへ診断を依頼する場合も、Codexはログを参照して提案するだけでfileやcommandを自動変更しない。

## CLI Compatibility Flow

Existing `sample-video` を共通fixtureとして次を確認する。

1. GUIでApplyされたscriptを `npm run validate -- sample-video` が読める。
2. GUIとCLIが `input/`、`public/`、`generated/`、`output/` の同じconventionsを使用する。
3. `validate`、`voice`、`timeline`、`preview`、`render` の全既存commandsが同じvideoIdで起動できる。
4. GUI専用metadataをcanonical project filesへ混入させない。
5. GUIの上書き確認はRenderer側の操作gateだけとし、existing CLI behaviorを変更しない。

## Traceability

- US-2: Existing commandsとproject foldersを変更せず共有する。
- US-16: Readiness、上書き確認、Render、output path、Finder actionを提供する。
- US-17: U6 operation stateとordered logsを再利用する。
- US-19: Failure message、logs、既存Render buttonによるmanual retryを提供する。


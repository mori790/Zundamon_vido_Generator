# Functional Design Plan: U8 Render Workflow and CLI Compatibility Verification

## Unit Context

- **Primary Stories**: US-2、US-16、US-19。
- **Supporting Story**: US-17。
- **Dependencies**: U1 Workspace、U3 active script、U5 assets、U6 Command Runner。
- **Existing Boundaries to Reuse**:
  - U6 `render` operation、operation state、Log Panel、Stop。
  - Existing `npm run render -- {videoId}` and `npm run video -- {videoId}` commands。
  - `renderVideo(videoId)` and `output/{videoId}.mp4` convention。
  - Existing VideoScript schema and project directories。
- **Out of Scope**: Render farm、cloud upload、new codec selection、render queue、CLI rewrite。

## Plan

### Step 1: Analyze Context

- [x] U8 unit definition、US-2、US-16、US-17、US-19を読む。
- [x] U1、U3、U5、U6 dependenciesとshared contractsを確認する。
- [x] Existing render CLI、Render Service、output path、failure flowを確認する。

### Step 2: Resolve Functional Decisions

- [x] Functional Design questionsを作成する。
- [x] すべての `[Answer]:` を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] 必要ならclarification questionsを作成して解決する。

### Step 3: Generate Functional Design

- [x] `business-logic-model.md` を作成する。
- [x] `business-rules.md` を作成する。
- [x] `domain-entities.md` を作成する。
- [x] `frontend-components.md` を作成する。

### Step 4: Validate and Complete

- [x] Markdown構文とspecial charactersを検証する。
- [x] US-2、US-16、US-17、US-19 traceabilityを検証する。
- [x] Extension Rule Complianceを記録する。
- [x] U8 Functional Design completion messageを提示する。

## Functional Design Questions

各質問の `[Answer]:` へ選択肢の文字を記入してください。

## Question 1
GUIからRenderを開始する前に、必要なVoiceとTimelineが不足または古い場合はどうしますか？

A) Render開始時にVoice、Timelineを必要順に自動生成してからRenderする

B) Renderを開始せず、不足項目と実行すべき操作を表示する

C) Existing render commandへ任せ、失敗した場合だけログを表示する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Question 2
既存の `output/{videoId}.mp4` がある状態でRenderを開始した場合はどうしますか？

A) Existing CLI behaviorに合わせ、確認なしで同じpathへ上書きする

B) GUIで上書き確認を表示してからRenderする

C) Timestamp付きの別fileへ出力する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Question 3
Render成功後、GUIにどの結果操作を提供しますか？

A) Output pathを表示するだけ

B) Output pathとFinderで表示する操作を提供する

C) Output path、Finderで表示、動画を開く操作を提供する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Question 4
Render失敗後のMVP recoveryはどこまで提供しますか？

A) Error、関連logs、再実行ボタンを表示する

B) Errorとlogsだけを表示し、既存Renderボタンから再実行する

C) Error、logs、再実行に加えてCodex診断用のpromptを自動作成する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:b

## Question 5
CLI compatibility verificationはどのcommand範囲を必須としますか？

A) `validate`、`voice`、`timeline`、`preview`、`render` の全既存command

B) U8に直接関係する `validate` と `render` だけ

C) Full pipelineの `video` commandだけ

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Question 6
GUI作成projectとCLIの互換性をどのsampleで検証しますか？

A) Existing `sample-video` をGUIで更新し、同じvideoIdをCLIで検証する

B) U8専用の一時videoIdを作成し、検証後に削除する

C) Existing sampleと新規GUI projectの両方を検証する

X) Other (please describe after `[Answer]:` tag below)

[Answer]:a

## Content Validation

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式、空行、`[Answer]:` tags、pathsを検証済み。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

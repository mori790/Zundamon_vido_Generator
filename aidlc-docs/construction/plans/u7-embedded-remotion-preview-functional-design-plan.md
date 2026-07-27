# Functional Design Plan: U7 Embedded Remotion Preview

## Unit Context

- **Primary Story**: US-15。
- **Dependencies**: U1 Electron App Shell、U3 JSON Draft Review、U6 Command Runner。
- **Existing Decisions**: GUI内プレビューを主案とする。
- **Existing Boundaries to Reuse**:
  - `ZundamonVideo` composition。
  - `buildRenderData(videoId)`。
  - U6 Preview commandとoperation/log state。
  - U3 active scriptとdraft separation。
- **Out of Scope**: MP4 render、composition editing、multi-preview、cloud preview。

## Plan

### Step 1: Analyze Context

- [x] U7 unit definition、US-15、dependency mapを読む。
- [x] Preview ServiceとPreview Panelのapplication designを読む。
- [x] 既存Remotion composition、render data builder、preview command、U6境界を読む。

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
- [x] US-15 traceabilityを検証する。
- [x] Extension Rule Complianceを記録する。
- [x] U7 Functional Design completion messageを提示する。

## Functional Design Questions

各質問の `[Answer]:` へ選択肢の文字を記入してください。

## Question 1
埋め込みPreviewはどのデータを表示対象にしますか？

A) Apply済みのactive scriptと生成済みmanifest/timelineだけを表示する

B) 未Applyのdraftも一時的なpreview dataへ変換して表示する

C) active scriptを既定にし、draft previewを明示的に選択可能にする

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 2
Previewに必要なtimelineやvoice manifestが存在しない場合、どう扱いますか？

A) 不足項目を表示し、U6のVoiceまたはTimeline操作へ誘導する

B) Preview開始時に不足する生成処理を自動実行する

C) 埋め込みPreviewを使わず、すぐRemotion Studio fallbackを起動する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:b

## Question 3
Previewが古いと判断する基準はどれですか？

A) active script、manifest、timeline各ファイルの更新時刻を比較する

B) U3 ApplyまたはU6 Voice/Timeline成功後に、メモリ上のstale flagを設定する

C) ファイル更新時刻とstale flagを併用する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 4
埋め込みPreviewのMVP操作はどこまで提供しますか？

A) 再生、一時停止、シーク、音量、全画面

B) 再生、一時停止、先頭へ戻るだけ

C) 再生、一時停止、シーク、音量まで。全画面は後続対応

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 5
U6のVoiceまたはTimeline成功後、Preview更新はどうしますか？

A) stale表示に変え、利用者がRefresh Previewを押す

B) Previewが開いていれば自動更新する

C) 自動更新前に確認を表示する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:b

## Question 6
埋め込みPreviewが初期化できない場合のfallbackはどう提供しますか？

A) エラーと「Remotion Studioで開く」ボタンをPreview Panel内に表示する

B) 自動的にRemotion Studioを起動し、GUIにはログだけを表示する

C) エラーだけを表示し、U6のPreviewボタンを利用者が押す

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Content Validation

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown質問形式、空行、`[Answer]:` tagsを検証済み。

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

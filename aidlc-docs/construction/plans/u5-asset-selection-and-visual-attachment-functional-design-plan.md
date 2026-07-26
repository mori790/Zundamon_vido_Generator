# Functional Design Plan: U5 Asset Selection and Visual Attachment

## Unit Context

- **Unit**: U5 Asset Selection and Visual Attachment
- **Primary Stories**: US-10、US-11
- **Supports**: US-9
- **Dependencies**: U1 Electron App Shell and Workspace Foundation、U3 JSON Draft Review and Scene Editing
- **Existing Boundaries to Reuse**:
  - U3 `ScriptDraft` and structured scene editor
  - Existing `VideoScript` image visual schema
  - Existing `checkAssets` public asset validation
  - Electron local file access
- **Out of Scope**: Asset library、image editing、cloud upload、preview、render、automatic source-file deletion

## Plan

### Step 1: Analyze Context

- [x] U5 unit definition and dependency mapを読む。
- [x] US-10、US-11、supporting US-9を読む。
- [x] U1/U3のdesign artifactsと現在のasset validation実装を読む。

### Step 2: Resolve Functional Decisions

- [x] Functional Design questionsを作成する。
- [x] すべての`[Answer]:`を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] clarification questionsは不要と判定する。

### Step 3: Generate Functional Design

- [x] `business-logic-model.md`を作成する。
- [x] `business-rules.md`を作成する。
- [x] `domain-entities.md`を作成する。
- [x] `frontend-components.md`を作成する。

### Step 4: Validate and Complete

- [x] Markdown構文とspecial charactersを検証する。
- [x] Story traceabilityを検証する。
- [x] Extension Rule Complianceを記録する。
- [x] U5 Functional Design completion messageを提示する。

## Functional Design Questions

各質問の`[Answer]:`へ選択肢の文字を記入してください。

### Question 1
MVPで選択可能にする画像形式はどれですか？

A) PNG、JPEG、WebP

B) PNG、JPEGのみ

C) Electronが画像として選択できる全形式

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:b

### Question 2
同名ファイルが`public/visuals/{videoId}/`に存在する場合、どう扱いますか？

A) 内容に関係なく連番を付けて別ファイルとして保存する

B) 既存ファイルを置き換える前に確認する

C) 同じ内容なら再利用し、異なる内容なら連番を付ける

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:b

### Question 3
選択した画像を`public/visuals/{videoId}/`へコピーするタイミングはいつですか？

A) ファイル選択確定時にコピーし、下書きを破棄しても画像ファイルは残す

B) 下書きのApply時にコピーし、Apply前は元ファイルを参照する

C) ファイル選択確定時にコピーし、下書き破棄時に未使用コピーを削除する

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 4
画像をSceneへ設定する際、positionとfitをどう決めますか？

A) 初期値を`center`と`contain`にし、Structured Scene Editorで両方を変更可能にする

B) MVPでは`center`と`contain`に固定する

C) 直前に選択したpositionとfitを次の画像にも引き継ぐ

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 5
既存の画像参照が見つからない場合、Structured Scene Editorでどう表示しますか？

A) Scene行と画像入力欄の両方にmissing表示し、Replace操作を提供する

B) Scene詳細にmissing pathとReplace操作だけを表示する

C) Validation一覧だけに表示し、Scene Editorは変更しない

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 6
Sceneから画像参照を外すとき、コピー済み画像ファイルも削除しますか？

A) JSON参照だけ外し、ファイルは削除しない

B) 他Sceneから参照されていなければ削除確認を表示する

C) 常にファイルも削除する

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:b

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

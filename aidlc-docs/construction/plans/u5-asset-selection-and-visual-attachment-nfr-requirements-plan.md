# NFR Requirements Plan: U5 Asset Selection and Visual Attachment

## Unit Context

- **Unit**: U5 Asset Selection and Visual Attachment
- **Primary Stories**: US-10、US-11
- **Dependencies**: U1、U3
- **Depth**: Standard
- **Constraints**: Local macOS Electron app、single video workspace、PNG/JPEG only、new dependencyなしを優先

## Plan

### Step 1: Analyze Functional Design

- [x] U5 Functional Design artifactsを読む。
- [x] U1/U3のfile access、draft、testing decisionsを確認する。
- [x] performance、safety、reliability、maintainability、usabilityの未確定事項を抽出する。

### Step 2: Resolve NFR Decisions

- [x] NFR Requirements questionsを作成する。
- [x] すべての`[Answer]:`を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] clarification questionsは不要と判定する。

### Step 3: Generate NFR Artifacts

- [x] `nfr-requirements.md`を作成する。
- [x] `tech-stack-decisions.md`を作成する。

### Step 4: Validate and Complete

- [x] Markdown構文を検証する。
- [x] Functional DesignとStory traceabilityを検証する。
- [x] Extension Rule Complianceを記録する。
- [x] U5 NFR Requirements completion messageを提示する。

## NFR Requirements Questions

各質問の`[Answer]:`へ選択肢の文字を記入してください。

### Question 1
1画像あたりのMVPファイルサイズ上限はどれですか？

A) 10 MB

B) 20 MB

C) 50 MB

D) 上限を設けない

E) Other（`[Answer]:`の後に詳細を記載）

[Answer]:b

### Question 2
画像選択からSceneへの反映までの応答性目標はどれですか？

A) 10 MB以下の画像を通常のlocal storageで1秒以内に反映する

B) 20 MB以下の画像を通常のlocal storageで2秒以内に反映する

C) 数値目標は設けず、copy中表示と操作無効化だけを必須にする

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:b

### Question 3
未参照画像の削除確認後、ファイルをどう削除しますか？

A) macOS Trashへ移動し、復元可能にする

B) `public/visuals/{videoId}/`から完全削除する

C) MVPでは削除操作を提供せず、参照解除だけにする

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:a

### Question 4
U5のfile dialog、copy、exists、delete操作をどのElectron境界へ置きますか？

A) U5でnarrow preload/IPC bridgeを導入し、rendererの任意filesystem accessを増やさない

B) U1/U3と同じrenderer `nodeIntegration`方式を継続し、IPC移行は後続でまとめる

C) file dialogだけmain processに置き、copy、exists、deleteはrendererで行う

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:b

### Question 5
PNG/JPEG形式の検証レベルはどれですか？

A) 拡張子とfile dialog filterだけを検証する

B) 拡張子に加えて先頭byte signatureも検証する

C) 画像decoderで完全に読み込めることまで検証する

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:c

### Question 6
U5のfile operation test範囲はどれですか？

A) injected adapterの単体テストとcomponent testだけにする

B) injected testに加え、一時directoryを使うcopy、collision、missing、Trash以外のpath検証を行う

C) Electronを起動するend-to-end testまで必須にする

D) Other（`[Answer]:`の後に詳細を記載）

[Answer]:c

## Extension Rule Compliance

- Security Baseline: N/A。`aidlc-state.md`で無効。
- Resiliency Baseline: N/A。`aidlc-state.md`で無効。
- Property-Based Testing: N/A。`aidlc-state.md`で無効。

# NFR Requirements Plan: U7 Embedded Remotion Preview

## Unit Context

- **Unit**: U7 Embedded Remotion Preview。
- **Functional Design**: 承認済み。
- **Primary Story**: US-15。
- **Dependencies**: U1、U3、U6、既存Remotion composition。
- **Constraint**: ローカルElectron application。cloud infrastructureなし。

## Plan

### Step 1: Analyze Functional Design

- [x] U7 business logic、business rules、domain entities、frontend componentsを読む。
- [x] 既存Remotion dependenciesとcomposition境界を確認する。
- [x] U6 command/fallback境界を確認する。

### Step 2: Resolve NFR Decisions

- [x] NFR Requirements questionsを作成する。
- [x] すべての `[Answer]:` を回収する。
- [x] 回答の矛盾と曖昧さを検証する。
- [x] 必要ならclarification questionsを作成して解決する。

### Step 3: Generate NFR Requirements

- [x] Performance、capacity、reliability要件を定義する。
- [x] Security、maintainability、usability要件を定義する。
- [x] Tech stack decisionsを定義する。
- [x] `nfr-requirements.md` と `tech-stack-decisions.md` を作成する。

### Step 4: Validate and Complete

- [x] Markdown構文とspecial charactersを検証する。
- [x] US-15とNFR traceabilityを検証する。
- [x] Extension Rule Complianceを記録する。
- [x] U7 NFR Requirements completion messageを提示する。

## NFR Requirements Questions

各質問の `[Answer]:` へ選択肢の文字を記入してください。

## Question 1
生成済みartifactが揃っている場合、Preview表示開始の目標時間はどれですか？

A) 操作後2秒以内

B) 操作後5秒以内

C) 初期MVPでは数値目標を設けず、loading状態を必須にする

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:b

## Question 2
MVPで保証するPreviewの最大規模はどれですか？

A) 1920x1080、30fps、30分まで

B) active scriptに設定された解像度とfpsを制限せず使用する

C) 1920x1080、30fps、10分まで

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 3
Previewのメモリと同時利用方針はどれですか？

A) WorkspaceごとにPlayerは1つだけとし、Workspaceを閉じると解放する

B) 複数Preview tabを保持し、切り替え時もPlayer stateを維持する

C) Playerは1つだけだが、最後のplayback stateをWorkspaceごとに保存する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 4
Embedded Playerの技術選択はどれを採用しますか？

A) Remotion公式の `@remotion/player` を直接dependencyとして使用する

B) Remotion Studioをiframe相当で埋め込む

C) 独自のframe描画とplayback controlsを実装する

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 5
source file更新の検出方式はどれにしますか？

A) Preview open/refreshとU3/U6成功イベント時だけ更新時刻を確認する

B) Electron main processでfilesystem watcherを常時動かす

C) Preview表示中だけ一定間隔で更新時刻をpollingする

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 6
Embedded Previewのテスト範囲はどれにしますか？

A) readiness/stale純粋ロジックとPlayer UIを自動テストし、実映像・音声確認はmanual smoke testにする

B) Chromiumで実際のRemotion playbackまでE2E自動テストする

C) 自動テストは行わず、すべてmanual確認にする

D) Other（`[Answer]:` の後に詳細を記載）

[Answer]:a

## Question 7
AccessibilityのMVP要件はどれにしますか？

A) keyboard操作、visible focus、accessible labels、状態のtext表示を必須にする

B) mouse操作を優先し、keyboardとlabelsは後続対応にする

C) native Player controlsが提供する範囲だけにする

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

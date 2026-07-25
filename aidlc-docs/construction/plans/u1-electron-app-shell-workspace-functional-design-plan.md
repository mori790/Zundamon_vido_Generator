# Functional Design Plan: U1 Electron App Shell and Workspace Foundation

## Unit Context

- **Unit**: U1 Electron App Shell and Workspace Foundation.
- **Priority**: Must.
- **Purpose**: Establish the desktop app and single-video workspace.
- **First vertical slice contribution**: Open a video ID and prepare the workspace state needed for Codex planning and JSON draft display.

## Functional Design Checklist

- [x] Load unit definition and story map.
- [x] Identify U1 business logic and UI state boundaries.
- [x] Collect user answers for U1 behavior.
- [x] Analyze answers for ambiguity or contradictions.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Generate `frontend-components.md`.
- [x] Validate functional design completeness.

## Stories Covered

- US-1: Open or create a single video project.
- US-20: Continue manually when Codex is unavailable.

## Questions

Please answer every `[Answer]:` tag below before functional design artifacts are generated.

## Question 1
U1の最初の画面で、動画IDはどう入力しますか？

A) 起動直後に動画ID入力フォームだけを表示する

B) `input/` 内の既存JSON一覧と新規動画ID入力を両方表示する

C) 最初は新規動画ID入力だけにし、既存一覧は後回しにする

X) Other (please describe after [Answer]: tag below)

[Answer]: b

## Question 2
指定した動画IDの `input/{videoId}.json` が存在しない場合、どう扱いますか？

A) 空の下書きワークスペースとして開く

B) 最小テンプレートのscriptをメモリ上に作るが、保存はしない

C) エラーにして、先にJSON作成を促す

X) Other (please describe after [Answer]: tag below)

[Answer]: a

## Question 3
既存JSONの読み込みに失敗した場合、U1ではどう扱いますか？

A) ワークスペースを開かず、エラーだけ表示する

B) ワークスペースは開き、エラー状態として表示してCodex相談や手動修正に進める

C) 壊れたJSONをraw editorで開き、構造ビューは無効にする

X) Other (please describe after [Answer]: tag below)

[Answer]: a

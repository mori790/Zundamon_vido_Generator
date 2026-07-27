# Logical Components: U3 JSON下書きレビューとシーン編集

## Draft State Controller

- **配置候補**: `src/studio/shared/script-draft.ts`
- **責務**:
  - active scriptから下書きを作成する。
  - 空ワークスペース用の最小下書きを作成する。
  - Raw JSON更新を受け取り、draft statusを更新する。
  - 構造化scene編集を受け取り、parsed scriptとraw JSONを同期する。
  - Add/Remove/Reorder sceneを処理する。
- **NFR貢献**:
  - Reactから状態遷移を分離し、テストしやすくする。
  - 100シーン以下で不要な再計算を避ける入口を作る。

## Draft Validator

- **配置候補**: `src/studio/shared/script-draft.ts`
- **責務**:
  - JSON parse errorをDraftValidationIssueへ変換する。
  - `videoScriptSchema`のschema errorをDraftValidationIssueへ変換する。
  - 最新validation generationだけを有効結果として扱う。
- **NFR貢献**:
  - Raw JSON編集中の非同期/遅延検証結果と最新入力状態の混同を防ぐ。
  - Apply前の最終検証を一箇所に集約する。

## Script Apply Adapter

- **配置候補**: `src/studio/shared/script-apply.ts`
- **責務**:
  - `input/{videoId}.json`と`input/{videoId}.json.bak`のパスを決定する。
  - FileAccessを受け取り、読み込み、バックアップ、保存を順序保証で実行する。
  - backup失敗とsave失敗を区別した結果を返す。
- **設計上の注意**:
  - ユーザー選択により、保存ロジック境界は`shared`側に置く。
  - Node/Electron固有の`window.require`取得はrenderer側の薄いFileAccess実装に残し、`shared`は注入されたFileAccessだけを使う。
- **NFR貢献**:
  - ファイル安全性をテスト可能にする。
  - 後続のIPC化でもApply順序の中核ロジックを再利用しやすい。

## Script Review Panel

- **配置候補**: `src/studio/renderer/ScriptReviewPanel.tsx`
- **責務**:
  - active script読み取り専用ビューを表示する。
  - Create Draft、Apply、Discardを表示する。
  - Raw JSON viewとStructured Scenes viewを切り替える。
  - Draft State Controllerへユーザー操作を渡す。
  - DraftValidationIssueとApplyResultを表示する。
- **NFR貢献**:
  - 状態バナーとエラー表示で誤保存を防ぐ。
  - キーボード操作可能なbutton/input/textarea構成にする。

## Raw JSON Editor

- **配置候補**: `src/studio/renderer/RawJsonEditor.tsx`
- **責務**:
  - `textarea`でraw JSONを編集する。
  - 入力変更をScript Review Panelへ通知する。
  - validation issueを近接表示する。
- **NFR貢献**:
  - 依存ライブラリを増やさず、MVP実装とテストを軽く保つ。

## Structured Scene Editor

- **配置候補**: `src/studio/renderer/StructuredSceneEditor.tsx`
- **責務**:
  - scene一覧と選択scene詳細を表示する。
  - type、text、emotion、characterVisible、durationBeforeSpeech、durationAfterSpeechを編集する。
  - Add、Remove、Move Up、Move Down操作を提供する。
  - Raw JSON無効時は最後の有効状態である注意バナーを表示する。
- **NFR貢献**:
  - 100シーン以下を想定し、初回は仮想スクロールなしで単純なリストを使う。
  - 操作はbutton/form inputで構成し、基本キーボード操作を満たす。

## FileAccess Implementation

- **配置候補**: `src/studio/renderer/script-file-access.ts`
- **責務**:
  - renderer環境で`window.require('node:fs/promises')`を使いFileAccessを作る。
  - `readFile`と`writeFile`を提供する。
- **NFR貢献**:
  - `shared`の保存ロジックからElectron/Node依存を分離する。
  - テストではメモリ実装に差し替えられる。

## Test Seams

- Draft State Controller: active script、raw JSON、scene operationを直接渡す。
- Draft Validator: parse/schema failureを直接渡す。
- Script Apply Adapter: FileAccessをメモリ実装に差し替える。
- Script Review Panel: initial active scriptとmock apply functionを渡す。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。

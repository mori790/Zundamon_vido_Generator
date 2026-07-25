# Tech Stack Decisions: U3 JSON下書きレビューとシーン編集

## Raw JSON Editor

- **採用**: 標準の`textarea`。
- **理由**:
  - 依存関係を増やさずに実装できる。
  - MVPでは構文ハイライトより、下書き編集とApply安全性の検証を優先する。
  - React Testing Libraryで操作を検証しやすい。
- **後続候補**: CodeMirrorなどの専用エディタは、長文編集やシンタックスハイライトが必要になった段階で検討する。

## Validation Timing

- **採用**: Raw JSON編集中は短い待機時間後にバリデーションする。
- **理由**:
  - 入力のたびに重い検証を走らせるより応答性を保ちやすい。
  - Apply前には必ず同期的に最終検証することで保存安全性を担保できる。

## Draft Logic Placement

- **採用**: `src/studio/shared/`または`src/studio/renderer/`配下の専用ロジックに分離する。
- **理由**:
  - Reactコンポーネントから状態遷移とバリデーションを切り離せる。
  - U4のCodex proposal flowからも再利用しやすい。

## File Access

- **採用**: U1/U2と同じレンダラー側ローカルファイルアクセスパターンを継続する。
- **理由**:
  - 既存U1の実装に合わせて、U3の垂直スライスを早く完成させる。
  - IPC強化は後続でまとめて扱える。
- **制約**:
  - 書き込み対象は`input/{videoId}.json.bak`と`input/{videoId}.json`に限定する。

## Backup Strategy

- **採用**: Apply時に`input/{videoId}.json.bak`を作成し、既存`.bak`は上書きする。
- **理由**:
  - 操作が単純で、ローカルMVPとして理解しやすい。
  - タイムスタンプ付きバックアップ管理より実装範囲を抑えられる。

## Testing Stack

- **採用**:
  - Vitest for logic tests.
  - React Testing Library for component tests.
  - Injected file access for save/apply adapter tests.
- **対象**:
  - 下書き状態ロジック。
  - Raw JSON invalid path。
  - シーン追加/削除/並び替え。
  - Apply時のバックアップと保存順序。
  - ScriptReviewPanelの主要操作。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。

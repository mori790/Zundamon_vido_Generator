# NFR Design Patterns: U3 JSON下書きレビューとシーン編集

## 保存安全性パターン

### Apply Sequence

Applyは次の順序で実行する。

1. 現在の下書きを最終バリデーションする。
2. バリデーション失敗時は保存処理を開始しない。
3. `input/{videoId}.json`の現在内容を読み込む。
4. `input/{videoId}.json.bak`へバックアップを書き込む。
5. 下書きを整形済みJSONとして`input/{videoId}.json`へ保存する。
6. 保存成功後、ワークスペースのactive scriptを保存済み下書きへ更新する。
7. 下書き状態を`applied`へ更新する。

### Backup Failure Stop

- バックアップ作成に失敗した場合、正式JSON保存へ進まない。
- UIはApply失敗状態を表示し、下書きを保持する。
- ユーザーは問題を修正したあと再Applyできる。

### Save Failure Retry

- 正式JSON保存に失敗した場合、下書きを保持する。
- UIはエラー表示と再Applyボタンを出す。
- 自動復元はU3では行わない。
- 既存`.bak`は上書きしてよい。

## 性能パターン

### Debounced Raw Validation

- Raw JSON編集では短い待機時間後にparse/schema validationを実行する。
- 入力中のtextarea操作はバリデーションでブロックしない。
- Apply時だけは最新Raw JSONに対して即時に最終検証する。

### Lightweight Recalculation

- 初回実装では仮想スクロールや大規模リスト最適化は入れない。
- 100シーン以下を目標に、不要なJSON整形、全体再生成、全scene再計算を避ける。
- 構造化編集では変更対象のsceneを更新し、その後必要な範囲でraw JSONを再生成する。

### Validation Generation Tracking

- Raw JSON文字列に更新世代番号を持たせる。
- バリデーション完了時に、結果が最新世代に対応しているか確認する。
- 古い世代の検証結果はUIへ反映しない。
- これにより、入力済みの新しい内容と古い検証結果を混同しない。

## UI/アクセシビリティパターン

### State Banner

- `readonly-active`: 既存台本を読み取り専用で表示していることを示す。
- `draft`: 下書きを編集中で、まだ保存されていないことを示す。
- `invalid`: Raw JSONまたはschemaが無効で、Applyできないことを示す。
- `applied`: 下書きが正式JSONへ保存されたことを示す。
- `save-failed`: 下書きを保持したまま、再Apply可能であることを示す。

### Stale Structured View Banner

- Raw JSONが無効な間も構造化ビューは表示する。
- 構造化ビュー上部に「最後に有効だったJSONを表示中」である注意バナーを出す。
- この状態でもユーザーはRaw JSONへ戻って修正できる。

### Keyboard Baseline

- タブはbutton要素で実装する。
- Apply、Discard、Create Draft、Add、Remove、Move Up、Move Downはbutton要素で実装する。
- 入力欄にはlabelまたはaria-labelを付ける。
- CSSでフォーカス状態を見えるようにする。

## テストパターン

- Draft State Controllerは純粋関数または副作用を注入可能な関数としてテストする。
- Apply処理はFileAccessを注入して、backup先行、save失敗、再Apply可能状態をテストする。
- UIはReact Testing Libraryで主要操作を検証する。
- 100シーン代表データで下書き生成、JSON整形、validationが壊れないことを確認する。

## Extension Rule Compliance

- Security Baseline: N/A。無効。
- Resiliency Baseline: N/A。無効。
- Property-Based Testing: N/A。無効。

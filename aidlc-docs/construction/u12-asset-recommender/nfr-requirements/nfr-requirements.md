# NFR Requirements: U12-D 素材割り当て

## 1. 応答性 — シーン単位ローディング状態

- 「素材を選択」ボタン押下から `asset.copy()` の完了（成功・失敗問わず）まで、該当シーンカードのボタンを `disabled` にし、ラベルを「選択中...」に変更する。
- `loadingIndex: number | null` 状態で管理する（同時選択は行わないため `Set` は不要）。
- 他のシーンカードの「素材を選択」ボタンは `loadingIndex !== null` のとき `disabled` にする（選択の競合防止）。
- 処理完了後は `loadingIndex` を `null` に戻す。

## 2. エラー処理 — シーンインライン表示・自動クリア

- `asset.copy()` が `{status: 'failed'}` を返したとき、対象シーンカードにエラーバナーを表示する。
- 同じシーンの「素材を選択」を再クリックした時点で、前のエラーメッセージを自動クリアする（ユーザーが手動でクリアする必要はない）。
- エラーは `errors: Record<number, string>` 状態（index キー）で管理し、成功時もクリアする。
- エラーはシーン単位のインライン表示。全体ブロック（上部エラーバナー）は使用しない。

## 3. 上書きポリシー — ダイアログなし

- `asset.copy(videoId, token, overwrite=true)` を使用して常に上書きする。
- `replacement-required` ケースは `overwrite=true` では通常発生しない。発生した場合も `copied` と同等に扱う（publicPath を採用）。
- 上書き確認ダイアログは表示しない。

## 4. 未割り当て許可

- 「次へ（JSON生成）」ボタンは `loadingIndex !== null` のときのみ `disabled` にする。
- `assetPublicPath: null` のシーンが存在しても「次へ」を許可する。
- 全シーン未割り当てのままでも「次へ」を許可する。

## 5. 素材プレビュー — ファイル名のみ

- 割り当て済み素材は `assetFileName` を表示する（画像サムネイルなし）。
- `LocalAssetSelection.bytes` はキャッシュや表示には使用しない（`bytes` は token → copy のために必要だが UI に使わない）。
- ファイル名の長さ制限: 表示上の切り詰めは CSS `text-overflow: ellipsis` に委ねる（実装しない）。

## 6. アクセシビリティ

- 「素材を選択」「クリア」ボタンに `type="button"` を付与する。
- `disabled` 状態のボタンに `aria-disabled="true"` は追加しない（HTML `disabled` 属性で十分）。

## 7. テストスコープ — テストなし

- U12-D のロジックは `asset.select()` と `asset.copy()` の IPC 呼び出し結果の状態反映のみ。
- 純粋関数が存在しないため Vitest 単体テストの追加対象はない。
- 既存の IPC ハンドラ（local-file-service.ts）は U5 実装時にテスト済み。
- **根拠**: テストのためにモックを増やすより、U12-D の簡潔性を保つことを優先する。

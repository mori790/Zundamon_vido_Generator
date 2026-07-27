# NFR Requirements: U12-C シーン調整UI

## 1. 信頼性 — Fail-Open 保存（U12-A/B 継承）

- 完了ボタン押下時の `localFileApi.draft.write()` は非同期で実行し、保存失敗時は `console.error` のみ。
- 保存失敗があっても `onConfirm(finalScenes)` の呼び出しとタブ切り替えはブロックしない。
- **根拠**: U12-A/B で確立したパターンの一貫適用。シーン情報はインメモリで U12-D/E へ引き継げる。

## 2. 信頼性 — シーン数制限なし

- シーン数に上限を設けない（実用上 1〜30 件程度を想定）。
- `editableScenes.length === 0` のとき「完了」ボタンを `disabled` にする（保存対象なし）。
- 上限チェックによる追加エラーは実装しない。

## 3. データ品質 — 空フィールドの許容

- title / narration が空のシーンのまま「完了」を許可する。
- `finalizeScenes()` は空フィールドを `''` としてそのまま保存する（trim のみ）。
- バリデーションエラーメッセージや警告バナーは表示しない。
- **根拠**: AI 分割の結果として空フィールドが生じることがある。ユーザーが意図的に空にすることも許容する。

## 4. 編集保護 — 自動保存なし

- 編集中の自動保存は行わない。
- 「完了」ボタン押下時のみ SceneDraft を上書き保存する。
- **根拠**: 編集中の中途状態を誤って保存しない（U12-B の SceneDraft を保護する）。

## 5. アクセシビリティ

- 「▲」「▼」「削除」のアイコンボタンには `aria-label` を必ず付与する。
- 先頭シーンの「▲」、末尾シーンの「▼」には `disabled` 属性を設定する（キーボード操作での誤操作防止）。

## 6. テスト可能性 — ロジック抽出パターン

- シーン操作の純粋関数は `src/studio/renderer/scene-editing.ts` に実装・エクスポートする。
- `EditableScene` 型も同ファイルで定義・エクスポートし、`SceneListTab` と `SceneCard` から import する。
- 純粋関数のテストは Vitest で直接実行する（DOM・React 不要）。
- テスト対象: `moveScene`, `addScene`, `removeScene`, `updateSceneField`, `finalizeScenes`, `parseTags`

## 7. 「保存中」フラグ

- 完了ボタン押下から `onConfirm` 呼び出しまでの間は `saving: boolean` フラグを `true` にする。
- `saving === true` のとき「完了」ボタンを `disabled` にし、ラベルを「保存中...」にする。
- 保存完了（成功・失敗問わず）後は `saving` を `false` に戻す（ただしタブ切り替えでアンマウントされるため通常は不要）。

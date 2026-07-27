# NFR Requirements: U12-B AIシーン分割エンジン

## スコープ

U12-Bはプロンプト生成・Codex IPC送信・レスポンスパース・SegmentationResult返却・SceneDraftへの保存を対象とする。Codex接続管理（U2）・シーン調整UI（U12-C）はスコープ外。

## パフォーマンス

- シーン分割ボタンをクリック後、処理中インジケーターは即時表示する（1フレーム以内）。TextInputTab の status が `'segmenting'` に遷移することで UIをブロックしない。
- Codex のレスポンス待機タイムアウトは **120秒** とする。タイムアウト後は `SegmentationResult{ reason: 'timeout' }` を返し、処理を終了する。
- draftText のバイト数（UTF-8）が Codex の最大プロンプトサイズである **`CODEX_MAX_PROMPT_BYTES`（64 KiB = 65,536 bytes）** を超える場合、Renderer 側でプロンプト送信前に検出し、`SegmentationResult{ reason: 'turn-failed', message: '...' }` として扱う（Codex への送信は行わない）。

## 応答性

- シーン分割処理中はテキストエリア・FileLoadButton・SegmentationButton を無効化する（U12-A TextInputTab の `isProcessing` フラグと同じ制御）。
- 分割完了後は次のUI遷移（シーン調整タブへの切り替え）が即時に行われる（追加アニメーションなし）。

## 信頼性

- すべてのエラーケース（codex-not-connected / codex-turn-active / turn-failed / parse-error / empty-result / timeout）は **fail-fast** とする。リトライは行わない。ユーザーが手動で再試行する。
- エラー時に draftText はメモリ上に保持し、TextInputTab のテキストエリアは変更しない。
- タイムアウト発生時は IPC ハンドラ内で `clearTimeout` と `unsub` を確実に呼び出し、リソースリークを防ぐ。
- シーン分割成功後の `SceneDraft` 保存（`draft.write()`）は Renderer 側で非同期に行う。保存失敗はコンソールログのみ（U12-A の Fail-Open パターンを継承）。

## セキュリティ

- draftText はプロンプトテンプレート内で `---` で囲んで送信することで、プロンプトインジェクションリスクを軽減する。
- プロンプト送信前に `CODEX_MAX_PROMPT_BYTES` チェックを行い、オーバーサイズな draftText を Codex へ送信しない。
- U12-B はファイルシステムへ直接アクセスしない。全データはIPC経由で取得・保存する。

## テスト要件

- **必須（単体テスト）**:
  - `buildSegmentationPrompt(draftText)`: プロンプト文字列に draftText が正しく含まれることを確認する。
  - `parseSegmentationResponse(responseText)`:
    - 正常系: JSON コードブロックを含む応答 → `Scene[]` を返す。
    - 正常系: コードブロックなし（生JSON）→ フォールバックで `Scene[]` を返す。
    - 失敗系: 不正なJSON → `{ ok: false, reason: 'parse-error' }` を返す。
    - 失敗系: 空配列 → `{ ok: false, reason: 'empty-result' }` を返す。
    - 欠損フィールド: title/narration/tags が欠損している要素はフォールバック値（空文字列 / []）で補完する。
    - シーンID: 割り当て結果が `scene-001`, `scene-002`, ... であることを確認する。
- **任意（統合テスト）**: IPC ハンドラのモックテストは今回の必須スコープ外。

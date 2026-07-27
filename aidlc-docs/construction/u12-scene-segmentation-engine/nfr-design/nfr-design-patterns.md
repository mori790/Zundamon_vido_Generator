# NFR Design Patterns: U12-B AIシーン分割エンジン

## Fail-Fast パターン（Fail-Fast Pattern）

- シーン分割のすべてのエラーケース（codex-not-connected / codex-turn-active / turn-failed / parse-error / empty-result / timeout）は、発生した時点で即座に `SegmentationResult{ ok: false }` を返す。
- リトライは行わない。ユーザーが SegmentationButton を再クリックして手動再試行する。
- IPC ハンドラの Promise は、すべてのコードパスで必ず一度だけ `resolve` を呼ぶ（二重 resolve 防止のため `unsub` 後は早期 return する）。

## Promise + タイムアウト パターン（Promise + Timeout Pattern）

- IPC ハンドラ全体を `new Promise<SegmentationResult>()` でラップする。
- `setTimeout(120_000)` でタイムアウトを設定し、タイムアウト発生時に `unsub` と `clearTimeout` を確実に呼び出してから `resolve` する。
- `turn-completed` / `turn-failed` イベント受信時も `clearTimeout` と `unsub` を呼び出してから `resolve` する。
- `codex.send()` の `catch` ハンドラも `clearTimeout` と `unsub` を呼び出す。
- どの分岐でも `unsub` と `clearTimeout` が必ず呼ばれることを保証する（リソースリーク防止）。

## 入力境界パターン（Input Boundary Pattern）

- `sceneSegmentationApi.segment(draftText, videoId)` 呼び出し前に Renderer 側で draftText のバイトサイズを確認する。
- `new TextEncoder().encode(draftText).byteLength` が `CODEX_MAX_PROMPT_BYTES` を超える場合、IPC 呼び出しをスキップして `SegmentationResult{ ok: false, reason: 'turn-failed', message: '...' }` を返す。
- Codex への不正サイズのプロンプト送信を防ぐ。

## ロジック抽出パターン（Logic Extraction Pattern）

- `buildSegmentationPrompt(draftText: string): string` を純粋関数として `src/studio/shared/scene-segmentation.ts` に定義する。Electron・IPC・React 不要で Vitest でテストする。
- `parseSegmentationResponse(responseText: string): SegmentationResult` を純粋関数として同ファイルに定義する。正規表現によるコードブロック抽出・JSON パース・フィールド検証・ID 割り当てを担う。
- IPC ハンドラ（main process）はこれらの純粋関数を呼び出すだけにとどめ、ロジックを持たない。

## Fail-Open 保存パターン（Fail-Open Save Pattern、U12-A 継承）

- シーン分割成功後の `SceneDraft` 保存（`localFileApi.draft.write()`）は非同期で行い、失敗時はコンソールログのみ。
- 保存失敗が UI をブロックすることはなく、インメモリの `Scene[]` は保持する。

## イベントリスナー登録順序パターン（Listener-Before-Send Pattern）

- `codex.onEvent()` によるイベント購読は必ず `codex.send()` より先に行う。
- これにより、send 直後にイベントが発火しても listeners が登録されていない期間をなくす。

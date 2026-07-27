# Code Generation Plan: U12-B AIシーン分割エンジン

## ユニットコンテキスト

- **ユニット**: U12-B AIシーン分割エンジン
- **目標**: 草案テキストをCodex経由でシーン配列に変換し、SceneDraftに保存してシーン調整タブ（U12-C placeholder）へ遷移する。
- **対象ストーリー**: US-3（AIによる意味的シーン自動分割）
- **依存**: U12-A完了済み（TextInputTab / LocalFileApi.draft / TextInputStatus）、U2（Codex IPC / CodexAppServerService）

## ターゲットコードロケーション

### 新規作成ファイル

| ファイル | 役割 |
|---|---|
| `src/studio/shared/scene-segmentation.ts` | Scene / SceneDraft / SegmentationResult / SceneSegmentationApi 型定義。buildSegmentationPrompt / parseSegmentationResponse 純粋関数。 |
| `tests/studio/scene-segmentation.test.ts` | buildSegmentationPrompt / parseSegmentationResponse 単体テスト（境界値・フォールバック・ID割り当て） |

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `src/studio/main/main.ts` | `scene-segmentation:segment` IPC ハンドラを追加する（Listener-Before-Send・120秒タイムアウト・Fail-Fast）。 |
| `src/studio/main/preload.ts` | `sceneSegmentationApi` を `contextBridge.exposeInMainWorld` で公開する。 |
| `src/studio/renderer/TextInputTab.tsx` | `onSegmentationRequest` prop を `onSegmentationComplete(scenes: Scene[])` に変更する。セグメンテーションロジック（64KBチェック・IPC呼び出し・SceneDraft保存）をコンポーネント内に実装する。 |
| `src/studio/renderer/StudioApp.tsx` | `MainTab` 型に `'scenes'` を追加する。`onSegmentationComplete` でシーン状態を更新し `'scenes'` タブへ切り替える。scenes タブ placeholder を追加する。 |

### ドキュメント成果物

| ファイル | 内容 |
|---|---|
| `aidlc-docs/construction/u12-scene-segmentation-engine/code/summary.md` | 生成・変更ファイル一覧と US-3 への対応マッピング |

## 計画依存関係

新規 npm 依存なし。`CODEX_MAX_PROMPT_BYTES` は既存 `src/studio/shared/codex-app-server.ts` から import する。

## ステップ別生成計画

### Step 1: 共有型定義と純粋関数

- [ ] `src/studio/shared/scene-segmentation.ts` を作成する。
  - `Scene`, `SceneDraft`, `SegmentationErrorReason`, `SegmentationResult`, `SceneSegmentationApi` 型を定義する。
  - `buildSegmentationPrompt(draftText: string): string` を実装する（テンプレートリテラルで分割プロンプト生成）。
  - `parseSegmentationResponse(responseText: string): SegmentationResult` を実装する:
    1. ` ```json ... ``` ` コードブロックを正規表現で抽出
    2. 見つからない場合、最初の `[` から最後の `]` を試行
    3. `JSON.parse()` → Array チェック → 空配列チェック
    4. 各要素の title / narration / tags をフォールバック補完（欠損は空文字 / []）
    5. `scene-001` 形式で ID 割り当て

### Step 2: Main Process IPC ハンドラ

- [ ] `src/studio/main/main.ts` に `scene-segmentation:segment` ハンドラを追加する。
  - `buildSegmentationPrompt` / `parseSegmentationResponse` を `scene-segmentation.ts` から import する。
  - Listener-Before-Send パターン: `onEvent` 登録 → `codex.send()` の順序を守る。
  - Promise + 120秒タイムアウト: すべての分岐で `clearTimeout(timeout)` と `unsub()` を呼び出す。
  - `codex.send()` の catch: 'not connected' / 'already active' をエラーメッセージで判定してそれぞれの reason を返す。
  - `turn-completed` イベント: `parseSegmentationResponse(event.message.content)` を呼び出して返す。
  - `turn-failed` イベント: `{ ok: false, reason: 'turn-failed', message: event.message }` を返す。

### Step 3: Preload 拡張

- [ ] `src/studio/main/preload.ts` を変更する。
  - `SceneSegmentationApi` を `scene-segmentation.ts` から import する。
  - `contextBridge.exposeInMainWorld('sceneSegmentationApi', { segment: ... } satisfies SceneSegmentationApi)` を追加する。

### Step 4: TextInputTab の変更

- [ ] `src/studio/renderer/TextInputTab.tsx` を変更する。
  - `SceneSegmentationApi`, `Scene`, `SceneDraft` を `scene-segmentation.ts` から import する。
  - `CODEX_MAX_PROMPT_BYTES` を `codex-app-server.ts` から import する。
  - `declare global { var sceneSegmentationApi: SceneSegmentationApi | undefined; }` を追加する。
  - Props を `onSegmentationRequest(text: string): void` から `onSegmentationComplete(scenes: Scene[]): void` に変更する。
  - `handleSegmentationStart` を async 関数に変更する:
    1. `validateTextInput` バリデーション（既存）
    2. 64KB チェック: `new TextEncoder().encode(state.draftText).byteLength > CODEX_MAX_PROMPT_BYTES` → 'segmentation-error'
    3. status を 'segmenting' に更新
    4. `sceneSegmentationApi.segment(state.draftText, videoId!)` を呼び出す
    5. `ok: false` → status を 'segmentation-error'、errorMessage を設定
    6. `ok: true` → SceneDraft を保存（Fail-Open）、status を 'has-text' にリセット、`onSegmentationComplete(scenes)` を呼び出す

### Step 5: StudioApp.tsx の変更

- [ ] `src/studio/renderer/StudioApp.tsx` を変更する。
  - `Scene` を `scene-segmentation.ts` から import する。
  - `MainTab` 型に `'scenes'` を追加する: `'workspace' | 'text-input' | 'scenes'`
  - `StudioContent` に `scenes: Scene[] | null` 状態を追加する。
  - タブバーに「シーン調整」タブを追加する。
  - `activeTab === 'scenes'` のとき: `ScenePlaceholder` コンポーネントを表示する（"シーンが生成されました（{count}件）。U12-C 実装後に詳細が表示されます。"）。
  - `TextInputTab` の prop を `onSegmentationComplete` に変更し、`setScenes(scenes); setActiveTab('scenes')` を実装する。

### Step 6: 単体テスト

- [ ] `tests/studio/scene-segmentation.test.ts` を作成する。
  - `buildSegmentationPrompt`:
    - draftText がプロンプトに含まれることを確認する。
    - 返却値が空文字でないことを確認する。
  - `parseSegmentationResponse`:
    - 正常系: JSON コードブロックを含む応答 → `{ ok: true, scenes }` を返す。
    - 正常系: コードブロックなし（生JSON）→ `{ ok: true, scenes }` を返す。
    - 正常系: シーン ID が `scene-001`, `scene-002` ... であることを確認する。
    - 正常系: 欠損フィールドがフォールバック値（空文字 / []）で補完されることを確認する。
    - 失敗系: 不正なJSON → `{ ok: false, reason: 'parse-error' }` を返す。
    - 失敗系: 空配列 → `{ ok: false, reason: 'empty-result' }` を返す。
    - 失敗系: Array でない JSON （オブジェクト等）→ `{ ok: false, reason: 'parse-error' }` を返す。

### Step 7: ドキュメント

- [ ] `aidlc-docs/construction/u12-scene-segmentation-engine/code/summary.md` を作成する。

### Step 8: 検証

- [ ] `npx tsc --noEmit` を実行する。
- [ ] `npm test` を実行する。
- [ ] `npm run studio:build` を実行する。

## ストーリートレーサビリティ

| ストーリー | カバー内容 |
|---|---|
| US-3 正常系 | テキスト入力 → Codex送信 → Scene[] パース → SceneDraft保存 → シーン調整タブへ遷移 |
| US-3 失敗系（Codex未接続） | SegmentationButton 押下 → 'codex-not-connected' エラーをTextInputStatusMessageで表示 |
| US-3 失敗系（パース失敗） | Codex応答がJSON不正 → 'parse-error' をTextInputStatusMessageで表示 |

## 承認ゲート

このプランはU12-B Code Generationの実装根拠となる。コード変更はこのプランの承認後に開始する。

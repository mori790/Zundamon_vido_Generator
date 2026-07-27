# Tech Stack Decisions: U12-B AIシーン分割エンジン

## ロジック・IPC

| 決定 | 選択 | 理由 |
|---|---|---|
| プロンプト生成 | 純粋関数 `buildSegmentationPrompt` | テスト可能な形で分離する。テンプレートリテラルで生成する。 |
| レスポンスパース | 純粋関数 `parseSegmentationResponse` | テスト可能かつ副作用なし。正規表現でJSONコードブロックを抽出する。 |
| タイムアウト実装 | `setTimeout` / `clearTimeout`（Node.js built-in） | 外部ライブラリ不要。main process 内で使用する。 |
| IPC パターン | `ipcMain.handle` / `ipcRenderer.invoke`（既存パターン） | 既存 U2 Codex IPC と同一パターンを踏襲する。 |

## Codex 連携

| 決定 | 選択 | 理由 |
|---|---|---|
| Codex 接続 | 既存 `CodexAppServerService` インスタンスを共有 | 新規プロセス起動は不要。既存接続を再利用する。 |
| プロンプトサイズ上限 | `CODEX_MAX_PROMPT_BYTES`（既存定数から import） | `src/studio/shared/codex-app-server.ts` の定数を再利用する。 |
| イベント購読 | `codex.onEvent()` 経由（既存 `CodexAppServerService` API） | 新規 IPC チャンネルは不要。ターン完了まで onEvent でリッスンする。 |

## 型定義

| 決定 | 選択 | 理由 |
|---|---|---|
| 共有型ファイル | `src/studio/shared/scene-segmentation.ts` | Scene / SceneDraft / SegmentationResult / SceneSegmentationApi を1ファイルにまとめる。 |
| SceneDraft ファイル | `src/studio/shared/scene-segmentation.ts` に含める | TextInputDraft の拡張型として同ファイルで定義する。 |

## テスト

| 決定 | 選択 | 理由 |
|---|---|---|
| テストフレームワーク | Vitest（既存） | 既存テスト環境を継続する。 |
| テスト対象 | `buildSegmentationPrompt` / `parseSegmentationResponse` の純粋関数 | IPC・Electron・Codex なしでテスト実行可能。 |
| 正規表現テスト | コードブロックあり・なし・複数ブロックの各ケース | パーサーの堅牢性を確認する。 |

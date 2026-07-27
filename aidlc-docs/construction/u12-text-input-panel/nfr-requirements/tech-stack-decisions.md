# Tech Stack Decisions: U12-A テキスト入力パネル

## フレームワーク・ランタイム

| 決定 | 選択 | 理由 |
|---|---|---|
| UIフレームワーク | React（既存） | 既存StudioアプリはReactで実装済み。変更なし。 |
| スタイリング | 既存CSSクラス / インラインスタイル | 既存Studioスタイルを踏襲する。 |
| 状態管理 | Reactローカルステート（useState/useReducer） | U12-AはTextInputTabのローカルステートで完結する。グローバルステアへの依存はDraftPersistenceService経由に限定。 |
| TypeScript | 既存設定を継続 | 型安全性を維持する。 |

## ファイル読み込み

| 決定 | 選択 | 理由 |
|---|---|---|
| ファイル選択ダイアログ | Electron `dialog.showOpenDialog`（IPC経由） | 既存U1/U6と同様のMain process IPC経路を使用する。 |
| ファイル読み込み | `fs.readFile`（Node.js、IPC経由） | Rendererから直接fsを使わず、Main processのIPCハンドラ経由で読む。 |
| ファイルサイズチェック | ファイルのバイト数を読み込み前に確認（stat or readFile後） | 1MB超は早期リジェクト。 |

## ドラフト永続化

| 決定 | 選択 | 理由 |
|---|---|---|
| 永続化フォーマット | JSON（`draft-{id}.json`） | 既存のSceneDraftスキーマと統一する。 |
| デバウンス実装 | `useEffect` + `setTimeout` / `clearTimeout` | 外部ライブラリ不要。既存コードベースと一貫。 |
| デバウンス間隔 | 500ms | 一般的なオートセーブ間隔。過剰な書き込みを防ぐ。 |
| 書き込みエラー時 | コンソールログ + 再試行（次のデバウンス） | ユーザーをブロックしない。メモリは正として扱う。 |

## テスト

| 決定 | 選択 | 理由 |
|---|---|---|
| テストフレームワーク | Vitest（既存） | 既存テスト環境を継続する。 |
| テスト対象 | 純粋関数・ロジック（バリデーション・ファイルチェック・DraftPersistence） | コンポーネントテストは必須スコープ外。ロジック単体テストを優先。 |
| Electron dialogモック | テスト内でモジュールモックを使用 | Electron環境をVitest内で再現する標準的アプローチ。 |

# Tech Stack Decisions: U6 コマンド実行とログパネル

## 実行方式

U6は既存CLI互換性を優先し、Electron main processから既存npm scriptsをspawnする。

採用する方式:

- `node:child_process` の `spawn` を使う。
- shell文字列ではなく、固定コマンドと引数配列で実行する。
- RendererはCommandTypeと現在の `videoId` だけを渡す。
- Main processのCommandCatalogがnpm scriptへ変換する。

理由:

- 既存CLIと同じ経路を使うため、GUIとCLIの挙動差を抑えられる。
- Voice、Timeline、Preview、Renderの現行スクリプトを再利用できる。
- U8のCLI互換性検証につなげやすい。

## CommandCatalog

固定マッピング:

- `validate`: `npm run validate -- {videoId}`
- `voice`: `npm run voice -- {videoId}`
- `timeline`: `npm run timeline -- {videoId}`
- `preview`: `npm run preview -- {videoId}`
- `render`: `npm run render -- {videoId}`

実装時は `npm` 実行ファイル解決とmacOS環境差を考慮し、Electron main process側に閉じ込める。

## IPC方針

U6ではElectron main processに狭いIPC境界を追加する。

想定イベント:

- `command:start`
- `command:stop`
- `command:log`
- `command:exit`
- `command:error`

Renderer側はIPCを直接扱うより、`command-client` のような薄いラッパーを通す。

## ログ保持方式

ログはRendererのセッションメモリにOperation単位で保持する。

- Operationごとに最新1,000行。
- 永続保存なし。
- Clear Logsで破棄。

永続保存は、ユーザーが必要性を確認した後の後続ユニットまたは改善として扱う。

## Stop方式

Stopはmain processが対象子プロセスへ終了要求を送る。

- Stop要求後10秒待つ。
- 10秒後も終了しなければ強制終了を試みる。
- 終了後、Rendererへ `cancelled` を通知する。

## テスト方針

必須テスト:

- CommandCatalogの固定マッピング。
- 未許可CommandTypeの拒否。
- 競合制御。
- Validate同時実行許可。

任意または後続テスト:

- Rendererボタン状態。
- ログ表示。
- Stop状態遷移。
- 実プロセスを使う統合テスト。

## 採用しない方式

core service直接呼び出しは初期U6では採用しない。

理由:

- GUIとCLIで実行経路が分かれ、互換性確認の負担が増える。
- Previewのように既にprocess起動を含む処理がある。
- U6の主目的は既存パイプラインのGUI化であり、内部サービス再編ではない。

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown構文は見出しと箇条書きのみを使用している。

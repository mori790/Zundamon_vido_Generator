# NFR Requirements: U6 コマンド実行とログパネル

## パフォーマンス要件

- コマンド開始後、GUI上の操作状態は200ms以内に `running` または前提Validate開始状態へ更新する。
- stdoutとstderrのログは、UIを詰まらせない範囲で逐次表示する。
- ログイベントはOperation単位で保持し、各Operationにつき最新1,000行までをメモリ保持する。
- 1,000行を超えた場合は古いログから切り捨てる。
- 長時間処理中でもWorkspace、CodexPanel、ログスクロール、Stop操作が反応不能にならないこと。

## 信頼性要件

- 子プロセス起動失敗はOperationの `failed` 状態として扱い、起動対象コマンドと原因をログに出す。
- Stop要求後はOperationを `stopping` にし、まず自然終了を待つ。
- Stop要求から10秒経過しても終了しない場合、強制終了を試みる。
- Stopにより終了したOperationは `cancelled` として扱う。
- Stop後に生成途中ファイルが残る可能性はログで明示する。
- 失敗またはキャンセル後、同じコマンドは再実行可能にする。

## 安全性と境界要件

- Rendererから任意のシェル文字列を渡せない設計にする。
- 実行可能コマンドはmain process側のCommandCatalogに固定する。
- `videoId` はU1の検証ルールを通した現在ワークスペースの値だけを使う。
- Voice、Timeline、Preview、Renderは保存済みの `input/{videoId}.json` だけを対象にする。
- U3の未保存または未適用ドラフトはU6の実行対象にしない。
- Security Baselineはプロジェクト設定上無効だが、任意コマンド実行を避ける境界はU6固有要件として維持する。

## 可用性とユーザビリティ要件

- Codex接続が失敗または未接続でも、U6の手動コマンド操作は利用できる。
- VOICEVOX未起動、入力JSON不正、アセット不足、Remotion失敗はログ全文に加え、上部ステータスに短い復旧ヒントを表示する。
- Validate失敗時は要求された後続コマンドを実行せず、Validateログを選択状態にする。
- PreviewやRenderの失敗時は終了コード、stderr、再実行可能状態を表示する。
- Validateは他コマンド実行中でも実行できるが、実行中コマンドを自動停止しない。

## 同時実行要件

- Voice、Timeline、Preview、Renderは同時実行不可。
- Voice、Timeline、Preview、Renderのいずれかが実行中の場合、他の生成系ボタンは無効化する。
- Validateは同時実行可能。
- Stopは対象Operation単位で操作できる。

## テスト要件

- CommandCatalogの固定マッピングを単体テストする。
- 任意コマンド文字列を受け取らないことを単体テストする。
- 競合制御でVoice、Timeline、Preview、Renderの同時実行がブロックされることを単体テストする。
- Validateが同時実行可能であることを単体テストする。
- Renderer UIの詳細テストは初期U6では必須としないが、手動確認項目として残す。

## 拡張ルール適用状況

- Security Baseline: `aidlc-state.md` で無効のためスキップ。
- Resiliency Baseline: `aidlc-state.md` で無効のためスキップ。
- Property-Based Testing: `aidlc-state.md` で無効のためスキップ。

## コンテンツ検証

- Mermaid図は含めていない。
- ASCII図は含めていない。
- Markdown構文は見出しと箇条書きのみを使用している。

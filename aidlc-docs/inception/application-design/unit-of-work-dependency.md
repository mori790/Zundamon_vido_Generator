# U12 Unit of Work Dependencies

## Dependency Matrix

| ユニット | 依存先 | 依存種別 | 理由 |
|---|---|---|---|
| U12-A テキスト入力パネル | 既存Studioアプリ（U1）、既存タブ構造 | 基盤 | タブ追加は既存ElectronシェルとUIフレームワークが必要 |
| U12-B AIシーン分割エンジン | U12-A、既存CodexパネルIPC（U2） | UI/サービス | 分割エンジンはテキスト入力とCodex IPC契約に依存 |
| U12-C シーン調整UI | U12-B（Scene[]型）、S3（DraftPersistenceService） | 状態/UI | シーン一覧はU12-Bの出力とドラフト永続化に依存 |
| U12-D 素材推薦パネル | U12-C（確定シーン）、S2（AssetCatalogService）、既存CodexIPC（U2） | ファイル/AI | 推薦はシーン確定・assetsフォルダスキャン・Codex呼び出しに依存 |
| U12-E JSON自動生成 | U12-D（素材割り当て確定）、S3、既存VideoScriptスキーマ、U3、U6、U7 | エンドツーエンド | JSON生成はドラフト全体確定と既存パイプライン接続に依存 |

## クリティカルパス

```
U12-A
  ↓
U12-B（Codex IPC依存あり）
  ↓
U12-C（DraftPersistenceService依存あり）
  ↓
U12-D（AssetCatalogService依存あり）
  ↓
U12-E（VideoScriptSchema・既存U3/U6/U7依存あり）
```

すべてのユニットは依存順に逐次実装する。並行実施の余地はない（各ユニットが前ユニットの出力型に依存するため）。

## 既存コンポーネントとの協調ポイント

| 協調ポイント | 関係ユニット | 内容 |
|---|---|---|
| Codex IPC契約（U2） | U12-B、U12-D | U12-B/U12-DはCodexへのプロンプト送受信にU2のIPC経路を利用する。U2のIPC契約を変更しない前提だが、バックグラウンド呼び出し（UIに非表示）の対応が必要か要確認。 |
| VideoScriptスキーマ | U12-E、U3 | U12-EはZodスキーマバリデーションを実行する。スキーマ変更は禁止。 |
| `input/{id}.json` パス規約 | U12-E、U3、U6 | U12-EはU3が参照する同一ファイルへ書き込む。書き込みタイミングと読み込みタイミングの競合に注意。 |
| DraftPersistenceService（S3） | U12-C、U12-D、U12-E | 同一の `draft-{id}.json` をC〜Eが共有する。スキーマバージョン管理が必要。 |
| assetsフォルダ構造 | U12-D（S2） | assetsフォルダのパス規約は変更しない。S2はスキャン結果をタイプ別にキャッシュする。 |

## リスクノート

- **Codex IPC非同期化**: S1（シーン分割）とS4（素材推薦）はどちらもCodex IPC経由で非同期呼び出しを行う。Codex UI（チャットパネル）を占有しないようにバックグラウンド呼び出しの実装が必要。
- **draft-{id}.json競合**: U12-CとU12-Dが同じドラフトファイルを更新する。書き込み競合を防ぐためS3を唯一の書き込み口とし、read-modify-writeを原子的に行う必要がある。
- **30+シーンのUI性能**: U12-Cが30〜100件のシーンカードをレンダリングする際の仮想スクロールまたはpage表示が必要かどうか、Functional Designで確定する。

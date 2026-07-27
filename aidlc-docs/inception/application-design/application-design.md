# U12 Application Design

## Design Decision Summary

承認されたApplication Designの選択:

- テキスト入力パネルはStudioメインエリアの新しい「テキスト入力」タブとして配置する。
- AIシーン分割エンジンは既存CodexパネルIPC（U2）を再利用してCodexと連携する。
- シーン分割ドラフト状態は `{workspace}/draft-{videoId}.json` に永続化する。
- 素材カタログはWorkspace選択時にassetsフォルダをスキャンしてメモリにキャッシュする。
- 生成JSONは `input/{videoId}.json` に直接書き込む（既存パイプライン再利用）。
- シーン調整UI（C3）は新規独立パネル。台本ドラフト編集UI（U3）はJSON手動修正ルートとして継続。
- 素材推薦プロンプトはナレーションテキスト + 素材ファイル名リストをCodexへ渡す。

## 実装境界

### U12 実装に含むもの

- テキスト入力パネル（貼り付け・ファイル読み込み）
- AIシーン分割エンジン（Codex IPC経由）
- シーン調整UI（並び替え・追加・削除・テキスト編集）
- 素材推薦パネル（AI推薦 + 人間確認・変更）
- DraftPersistenceService（`draft-{id}.json`）
- AssetCatalogService（assetsフォルダスキャン）
- VideoScriptGeneratorService（`input/{id}.json` 生成）

### U12 実装から除くもの

- 素材ライブラリ管理UI（assetsフォルダへの追加・削除・タグ付け）
- 複数プロジェクト同時編集
- クラウド保存・共有
- シリーズ管理・テンプレートライブラリ
- 既存Codexパネルのチャット体験の変更

## Component Summary

| コンポーネント | U12での状態 | 目的 |
|---|---|---|
| C1 テキスト入力パネル | 新規実装 | 草案テキストの入力ゲートウェイ |
| C2 AIシーン分割エンジン | 新規実装（S1） | テキスト → Codex → Scene[] |
| C3 シーン調整UI | 新規実装 | シーン一覧の確認・編集 |
| C4 素材推薦パネル | 新規実装（S4） | AI素材推薦 + 人間確認フロー |
| C5 JSON自動生成 | 新規実装（S5） | VideoScript生成・パイプライン接続 |
| Codexパネル（U2） | 継続・IPC再利用 | S1・S4のAIバックエンド |
| 台本ドラフト編集UI（U3） | 継続・変更なし | JSON手動修正ルート |
| コマンド実行パネル（U6） | 継続・変更なし | 音声生成・レンダリング |
| Remotionプレビュー（U7） | 継続・変更なし | 映像プレビュー |

## Service Summary

| サービス | 責務 | 主な出力 |
|---|---|---|
| S1 SceneSegmentationService | テキスト → Codex → Scene[] | Scene[] |
| S2 AssetCatalogService | assetsフォルダスキャン・キャッシュ | AssetCatalog |
| S3 DraftPersistenceService | draft-{id}.json read/write | 永続化ドラフト |
| S4 AssetRecommendationService | Codex素材推薦・パース | AssetRecommendation[] |
| S5 VideoScriptGeneratorService | VideoScript生成・書き込み | input/{id}.json |

## Key Dependencies

- 既存CodexパネルIPC（U2） — S1・S4のAI推論バックエンド
- 既存WorkspaceRootService — S2・S3のパス解決
- 既存VideoScriptスキーマ（Zodスキーマ） — S5のバリデーション
- 既存 `input/` ディレクトリ規約 — S5の出力先
- 既存台本ドラフト編集UI（U3） — JSON手動修正ルート（共有ファイル経由）

## Design Constraints

- Codexパネルの既存チャット体験を壊さない。
- assetsフォルダ構造を変更しない。
- 既存VOICEVOXパイプライン・Remotionレンダリングの起動方法を変更しない。
- `VideoScript` JSON形式（既存スキーマ）との後方互換を維持する。
- `input/{id}.json` へのバリデーション失敗時は書き込みをしない（fail-closed）。

## Extension Compliance Summary

| Extension | 状態 | 適用ルール |
|---|---|---|
| Security Baseline | Compliant | assetsパス検証、Codex入力サニタイズ、PII/token非記録、fail-closed JSON書き込み、VideoScriptスキーマ検証 |
| Resiliency Baseline | Compliant | ドラフト永続化（再起動継続）、Codex失敗時のテキスト保持、素材欠損時の部分エラー、JSON書き込み失敗時no-op |
| Property-Based Testing (Partial) | Compliant | VideoScript round-trip（S5）、シーン境界unique（C3）、素材パスschema-valid（C4）をPBT対象として識別 |

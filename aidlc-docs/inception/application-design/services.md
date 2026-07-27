# U12 Services

## S1: SceneSegmentationService

- **目的**: 草案テキストをCodex経由でシーン配列に変換する。
- **責務**:
  - シーン分割プロンプトを組み立て、既存CodexパネルIPC（U2）経由でCodexへ送信する。
  - レスポンスをパースして `Scene[]`（シーンタイトル・ナレーションテキスト・推薦タグ）を返す。
  - 処理中ステートをRendererへ通知する。
  - Codexエラー・タイムアウト時はfail-fastしてSegmentationErrorを返す。
- **主な入出力**:
  - 入力: `draftText: string`
  - 出力: `Promise<Scene[]>` または `SegmentationError`
- **依存**:
  - 既存CodexパネルIPC（U2実装）

## S2: AssetCatalogService

- **目的**: assetsフォルダをスキャンし、素材ファイルリストをメモリに保持する。
- **責務**:
  - Workspace選択時またはアプリ起動時にassetsフォルダを走査する。
  - 素材タイプ（立ち絵・背景・BGM/SE・字幕スタイル・説明画像）ごとにファイルパスリストを分類してキャッシュする。
  - Workspace切り替え時にキャッシュを再構築する。
- **主な入出力**:
  - 入力: Workspaceフォルダのrootパス
  - 出力: `AssetCatalog`（タイプ別ファイルパスリスト）
- **依存**:
  - 既存WorkspaceRootService（assetsフォルダパス解決）

## S3: DraftPersistenceService

- **目的**: シーン分割ドラフト状態（テキスト・シーン一覧・素材割り当て）をWorkspaceフォルダに永続化する。
- **責務**:
  - `{workspace}/draft-{videoId}.json` に対してread/writeを行う。
  - ドラフトのシリアライズ・デシリアライズを担当する。
  - ファイル書き込みエラー時はエラーを返し、インメモリステートは保持する。
  - アプリ再起動後にドラフトを復元する。
- **主な入出力**:
  - 入力: `videoId: string`, `draft: SceneDraft`
  - 出力: `Promise<void>` または `DraftPersistenceError`
- **依存**:
  - 既存WorkspaceRootService（Workspaceパス解決）

## S4: AssetRecommendationService

- **目的**: シーンのナレーションテキストと素材カタログを使ってCodexへ素材推薦を依頼する。
- **責務**:
  - シーンのナレーションテキスト + AssetCatalogから素材ファイル名リストを含む推薦プロンプトを組み立てる。
  - 既存CodexパネルIPC（U2）経由でプロンプトを送信し、推薦候補を取得する。
  - レスポンスを `AssetRecommendation`（タイプ別の推薦ファイルパス）型にパースする。
  - assetsフォルダに素材が存在しないタイプは「素材なし」状態として返し、他タイプの推薦は続行する。
- **主な入出力**:
  - 入力: `scene: Scene`, `catalog: AssetCatalog`
  - 出力: `Promise<AssetRecommendation>`
- **依存**:
  - 既存CodexパネルIPC（U2実装）
  - S2（AssetCatalogService）

## S5: VideoScriptGeneratorService

- **目的**: 確定したシーン・素材割り当てから `input/{videoId}.json` を生成し、既存パイプラインに接続する。
- **責務**:
  - `SceneDraft` を既存 `VideoScript` JSON形式にマッピングする。
  - 書き込み前に既存VideoScriptスキーマでバリデーションを実行する。
  - バリデーション成功時のみ `input/{videoId}.json` に書き込む（fail-closed）。
  - 生成後、既存台本ドラフト編集UI（U3）が同ファイルを参照できることを保証する。
- **主な入出力**:
  - 入力: `videoId: string`, `draft: SceneDraft`
  - 出力: `Promise<void>` または `GenerationError`
- **依存**:
  - S3（DraftPersistenceService）
  - 既存VideoScriptスキーマ（Zodスキーマ）
  - 既存 `input/` ディレクトリ規約

## Service Summary

| サービス | 主な責務 | 主な出力 |
|---|---|---|
| S1 SceneSegmentationService | テキスト → Codex → Scene[] | Scene[] |
| S2 AssetCatalogService | assetsフォルダスキャン・キャッシュ | AssetCatalog |
| S3 DraftPersistenceService | draft-{id}.json read/write | 永続化ドラフト |
| S4 AssetRecommendationService | Codex素材推薦・パース | AssetRecommendation[] |
| S5 VideoScriptGeneratorService | VideoScript生成・input/{id}.json書き込み | input/{id}.json |

# U12 Component Dependencies

## Dependency Matrix

| コンポーネント | 依存先 | 利用元 | 通信パターン |
|---|---|---|---|
| C1 テキスト入力パネル | S1（SceneSegmentationService） | ユーザー | Rendererからサービス呼び出し |
| C2 AIシーン分割エンジン（S1） | 既存CodexパネルIPC（U2） | C1 | IPC経由Codexプロンプト送受信 |
| C3 シーン調整UI | C2（Scene[]受け取り）、S3（ドラフト保存） | ユーザー、C4 | React状態管理 + DraftPersistenceService |
| C4 素材推薦パネル（S4） | S2（AssetCatalogService）、既存CodexIPC（U2）、S3 | C3（確定シーン受け取り） | Codex IPC + ファイルシステム読み取り |
| C5 JSON生成サービス（S5） | S3（SceneDraft読み込み）、既存VideoScriptスキーマ | C4（素材確定後）、既存U3 | ファイルシステム書き込み（input/{id}.json） |
| S2 AssetCatalogService | 既存WorkspaceRootService | C4、S4 | ファイルシステムスキャン |
| S3 DraftPersistenceService | 既存WorkspaceRootService | C3、C4、C5 | JSON read/write（draft-{id}.json） |

## データフロー

### フロー1: テキスト入力 → シーン分割

```
ユーザーがテキストを貼り付けまたはファイル読み込み
    ↓ C1（テキスト入力パネル）
バリデーション（空文字チェック）
    ↓ S1（SceneSegmentationService）
Codexプロンプト組み立て
    ↓ 既存CodexパネルIPC（U2）
Codexレスポンス受信・パース
    ↓ Scene[]
C3（シーン調整UI）に渡す
    ↓ S3（DraftPersistenceService）
draft-{id}.json に保存
```

### フロー2: シーン調整

```
ユーザーがシーン一覧を確認・編集（並び替え・追加・削除・テキスト編集）
    ↓ C3（シーン調整UI）
変更をリアルタイムで S3（DraftPersistenceService）に保存
    ↓
ユーザーがシーン確定を実行
    ↓ C4（素材推薦パネル）へ委譲
```

### フロー3: 素材推薦 → 割り当て

```
C4（素材推薦パネル）が確定シーン一覧を受け取る
    ↓ S2（AssetCatalogService）
assetsフォルダの素材ファイルリストを取得
    ↓ S4（AssetRecommendationService）
シーンごとに「ナレーションテキスト + 素材リスト」プロンプトを送信
    ↓ 既存CodexパネルIPC（U2）
推薦結果をシーンカードに表示
    ↓
ユーザーが承認または手動変更
    ↓ S3（DraftPersistenceService）
素材割り当てをドラフトに保存
```

### フロー4: JSON生成 → パイプライン接続

```
ユーザーがJSONを生成する
    ↓ C5（VideoScriptGeneratorService: S5）
S3からSceneDraftを読み込む
    ↓
VideoScriptへマッピング
    ↓
スキーマバリデーション
    ↓（成功時のみ）
input/{videoId}.json に書き込む
    ↓
既存台本ドラフト編集UI（U3）でJSONを閲覧・手動修正可能
    ↓
既存VOICEVOXパイプライン / Remotionプレビュー / レンダリングへ
```

## 既存コンポーネントとの境界

| 既存コンポーネント | U12との関係 | 変更要否 |
|---|---|---|
| Codexパネル（U2） | C2・C4がIPC経由で入力チャンネルとして利用 | IPC契約追加の可能性あり（Codex側UIへの通知が不要な「バックグラウンド呼び出し」が必要かどうか要詳細設計） |
| 台本ドラフト編集UI（U3） | C5が生成したinput/{id}.jsonをU3が表示・編集 | 変更なし（共有ファイルパスを経由） |
| コマンド実行パネル（U6） | 音声生成・レンダリングコマンドをそのまま利用 | 変更なし |
| Remotionプレビュー（U7） | C5生成後のJSONでプレビュー | 変更なし |
| WorkspaceRootService | S2・S3がWorkspaceパスを参照 | 変更なし（既存API利用） |
| VideoScriptスキーマ | C5がスキーマ検証に利用 | 変更なし（再利用） |

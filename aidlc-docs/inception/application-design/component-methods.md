# U12 Component Methods

## C1: テキスト入力パネル

| メソッド | シグネチャ | 責務 |
|---|---|---|
| `handlePaste` | `(text: string) => void` | テキストエリアへの貼り付けを受け取り、ステートへ格納する |
| `handleFileLoad` | `() => Promise<void>` | ファイル選択ダイアログを開き、.txt/.md を読み込んでステートへ格納する |
| `validateInput` | `(text: string) => ValidationResult` | 空文字列チェックを行い、エラーメッセージまたはOKを返す |
| `startSegmentation` | `() => void` | バリデーション後、SceneSegmentationServiceを呼び出す |

## C2: AIシーン分割エンジン（SceneSegmentationService）

| メソッド | シグネチャ | 責務 |
|---|---|---|
| `buildPrompt` | `(text: string) => string` | シーン分割プロンプト文字列を組み立てる |
| `segment` | `(text: string) => Promise<Scene[]>` | Codex IPC経由でプロンプトを送信し、レスポンスをScene[]に変換して返す |
| `parseResponse` | `(raw: string) => Scene[]` | CodexのJSON/テキストレスポンスをScene[]型にパースする |
| `handleError` | `(error: Error) => SegmentationError` | タイムアウト・接続エラーをSegmentationError型に変換する |

## C3: シーン調整UI

| メソッド | シグネチャ | 責務 |
|---|---|---|
| `renderSceneList` | `(scenes: Scene[]) => ReactNode` | シーンカード一覧を描画する |
| `reorderScene` | `(fromIndex: number, toIndex: number) => void` | シーンを並び替え、ドラフトを保存する |
| `addScene` | `(afterIndex: number) => void` | 指定位置に空シーンを挿入し、ドラフトを保存する |
| `deleteScene` | `(index: number) => Promise<void>` | 確認ダイアログを表示後にシーンを削除し、ドラフトを保存する |
| `updateNarration` | `(index: number, text: string) => void` | シーンのナレーションテキストを更新し、ドラフトを保存する |
| `confirmScenes` | `() => void` | シーン一覧を確定し、素材推薦パネル（C4）へ委譲する |

## C4: 素材推薦パネル（AssetRecommendationService）

| メソッド | シグネチャ | 責務 |
|---|---|---|
| `buildRecommendationPrompt` | `(scene: Scene, assetList: AssetCatalog) => string` | ナレーションテキスト + 素材ファイル名リストを含むプロンプトを組み立てる |
| `recommend` | `(scene: Scene) => Promise<AssetRecommendation>` | Codex IPC経由で推薦を取得し、AssetRecommendation型で返す |
| `recommendAll` | `(scenes: Scene[]) => Promise<AssetRecommendation[]>` | 全シーンの推薦を非同期で取得する（シーンごとに独立して実行） |
| `applyRecommendation` | `(sceneIndex: number, recommendation: AssetRecommendation) => void` | 推薦を素材割り当てに適用し、ドラフトを保存する |
| `overrideAsset` | `(sceneIndex: number, type: AssetType, assetPath: string) => void` | ユーザーが手動で素材を変更し、ドラフトを保存する |
| `renderPanel` | `(scene: Scene, recommendation: AssetRecommendation) => ReactNode` | シーンカードに推薦UIをインラインで描画する |

## C5: JSON自動生成・パイプライン接続（VideoScriptGeneratorService）

| メソッド | シグネチャ | 責務 |
|---|---|---|
| `mapToVideoScript` | `(draft: SceneDraft) => VideoScript` | ドラフト状態（シーン+素材）をVideoScriptオブジェクトに変換する |
| `validate` | `(script: VideoScript) => ValidationResult` | 既存VideoScriptスキーマでバリデーションを行う |
| `write` | `(videoId: string, script: VideoScript) => Promise<void>` | バリデーション後に `input/{videoId}.json` を書き込む |
| `generate` | `(videoId: string, draft: SceneDraft) => Promise<void>` | map → validate → write を一括実行する |

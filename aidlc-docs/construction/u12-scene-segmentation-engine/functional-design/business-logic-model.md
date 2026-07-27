# Business Logic Model: U12-B AIシーン分割エンジン

## シーン分割ワークフロー

```
ユーザーが「シーンに分割する」をクリック
    ↓ TextInputTab: onSegmentationRequest(draftText) 呼び出し
StudioApp: segmentScenes(draftText, videoId) 呼び出し
    ↓ IPC: scene-segmentation:segment
Main process: SceneSegmentationHandler
    ├── codex.send() が例外を投げる場合
    │   ├── "Codex is not connected." → SegmentationResult{ reason: 'codex-not-connected' }
    │   └── "Codex turn is already active." → SegmentationResult{ reason: 'codex-turn-active' }
    ├── 正常送信 → onEvent リスナー登録 + 120秒タイムアウト
    │   ├── turn-completed イベント受信
    │   │   └── parseSegmentationResponse(event.message.content)
    │   │       ├── JSON 抽出成功 + scenes.length > 0 → SegmentationResult{ ok: true, scenes }
    │   │       ├── JSON 抽出成功 + scenes.length === 0 → SegmentationResult{ reason: 'empty-result' }
    │   │       └── JSON 抽出失敗 → SegmentationResult{ reason: 'parse-error' }
    │   ├── turn-failed イベント受信 → SegmentationResult{ reason: 'turn-failed' }
    │   └── タイムアウト → SegmentationResult{ reason: 'timeout' }
    ↓ IPC レスポンス
Renderer: segmentScenes が SegmentationResult を受け取る
    ├── ok: true の場合
    │   ├── SceneDraft に scenes を追加して draft.write() 保存
    │   ├── TextInputTab のステータスを 'completed' に更新（暫定）
    │   └── [U12-C] シーン調整タブへ切り替え（activeTab = 'scenes'）
    └── ok: false の場合
        └── TextInputTab のステータスを 'segmentation-error' に更新
            errorMessage = result.message
```

## プロンプトテンプレート

```
以下の草案テキストを動画のシーンに分割してください。

草案テキスト:
---
{draftText}
---

以下のJSON形式でのみ回答してください（コードブロックで囲んでください）:

\`\`\`json
[
  {
    "title": "シーンのタイトル（簡潔に）",
    "narration": "このシーンで読み上げるナレーションテキスト（句読点付きの完全な文章）",
    "tags": ["推薦タグ"]
  }
]
\`\`\`

分割の基準:
- 意味のまとまり（段落・話題の転換）でシーンを区切る
- narration は VOICEVOX で読み上げる実際のテキスト（草案の言葉を活かす）
- tags は素材選定ヒントとなるキーワード（例: "桜", "春", "室内", "明るいBGM", "キャラクター正面"）
- 草案テキストの内容をすべてシーンでカバーする（省略しない）
```

## パース アルゴリズム

入力: `responseText: string`（Codexの `turn-completed.message.content`）

```
1. ````json ... ```` コードブロックを正規表現で抽出
   パターン: /```json\s*([\s\S]*?)\s*```/
2. コードブロックが見つからない場合:
   最初の "[" から最後の "]" を取り出して試行する
3. JSON.parse() を実行
4. 結果が Array でない場合 → parse-error
5. 各要素を検証:
   - title が string → 失敗時は空文字列にフォールバック（スキップしない）
   - narration が string → 失敗時は空文字列にフォールバック
   - tags が string[] → 失敗時は [] にフォールバック
6. scenes.length === 0 → empty-result
7. Scene ID を割り当て: `scene-${String(index + 1).padStart(3, '0')}`
8. 返却: Scene[]
```

## シーン ID 形式

- `scene-001`, `scene-002`, ... `scene-030`, `scene-031`, ...
- 3桁ゼロ埋め（既存の `input/{id}.json` のシーン ID と同形式）
- U12-C でシーン追加・削除された場合は、その時点で採番し直す（U12-Cのスコープ）

## エラーメッセージ一覧

| reason | ユーザー向けメッセージ |
|---|---|
| `codex-not-connected` | 「Codex接続が必要です。CodexパネルでCodexに接続してください。」 |
| `codex-turn-active` | 「Codexが応答中です。応答が完了してからシーン分割を再試行してください。」 |
| `turn-failed` | 「Codexがシーン分割に失敗しました: {event.message}」 |
| `parse-error` | 「Codexの応答をシーンとして解析できませんでした。再試行してください。」 |
| `empty-result` | 「シーンが生成されませんでした。草案テキストを確認して再試行してください。」 |
| `timeout` | 「シーン分割がタイムアウトしました（120秒）。再試行してください。」 |

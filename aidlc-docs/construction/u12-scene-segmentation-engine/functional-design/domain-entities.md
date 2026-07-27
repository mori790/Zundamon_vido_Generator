# Domain Entities: U12-B AIシーン分割エンジン

## Scene

シーン分割の基本単位。Codexの応答からパースして生成する。

```typescript
interface Scene {
  id: string;        // "scene-001", "scene-002", ... (1-indexed, 3桁ゼロ埋め)
  title: string;     // シーンタイトル（Codexが生成）
  narration: string; // VOICEVOXで読み上げるナレーションテキスト
  tags: string[];    // 素材推薦タグ（例: "桜", "明るいBGM", "室内"）
}
```

## SceneDraft

`draft-text.json` に永続化するドラフトのフルスキーマ。U12-A の `TextInputDraft` を拡張する。

```typescript
interface SceneDraft {
  draftText: string;          // テキストエリアの草案テキスト（U12-Aから継続）
  savedAt: string;            // ISO 8601: 最終保存タイムスタンプ
  scenes: Scene[] | null;     // null = 未分割。分割済みは Scene[] を保持
  segmentedAt: string | null; // ISO 8601: 最終シーン分割タイムスタンプ（未分割は null）
}
```

**後方互換性**: `draft-text.json` が `scenes` フィールドを持たない場合（U12-A 以前に保存されたファイル）は `scenes: null` として扱う。

## SegmentationResult

`scene-segmentation:segment` IPC チャンネルの戻り値。

```typescript
type SegmentationResult =
  | { ok: true; scenes: Scene[] }
  | {
      ok: false;
      reason:
        | 'codex-not-connected'  // Codex が接続されていない
        | 'codex-turn-active'    // 別のターンが実行中
        | 'turn-failed'          // Codex ターンが失敗
        | 'parse-error'          // JSON パース失敗
        | 'empty-result'         // パース成功だがシーン数ゼロ
        | 'timeout';             // 120秒タイムアウト
      message: string;
    };
```

## SegmentationStatus（UIステート）

TextInputTab の `TextInputStatus` を拡張するのではなく、U12-A の既存の `TextInputStatus` の `'segmenting'` と `'segmentation-error'` を U12-B が担う。

```typescript
// U12-A で定義済み（変更なし）
type TextInputStatus = 'idle' | 'has-text' | 'segmenting' | 'segmentation-error';
```

## SceneSegmentationPrompt（内部型）

Codex に送信するプロンプトの構成。

```typescript
interface SceneSegmentationPrompt {
  videoId: string;
  message: string;  // 分割指示 + draftText を含む完全プロンプト文字列
}
```

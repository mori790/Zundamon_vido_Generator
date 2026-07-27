# Domain Entities: U12-A テキスト入力パネル

## TextInputDraft

草案テキストのドラフト状態。`draft-{videoId}.json` の一部として永続化する。

```typescript
interface TextInputDraft {
  draftText: string;          // テキストエリアの内容（空文字列可）
  savedAt: string;            // ISO 8601 タイムスタンプ
}
```

## TextInputState

テキスト入力パネルのUIステート（メモリのみ、永続化しない）。

```typescript
type TextInputStatus =
  | 'idle'               // テキストなし、または入力中
  | 'has-text'           // テキストあり、シーン分割可能
  | 'segmenting'         // シーン分割処理中
  | 'segmentation-error' // シーン分割失敗

interface TextInputState {
  draftText: string;
  status: TextInputStatus;
  errorMessage: string | null;
}
```

## TextInputValidationResult

シーン分割開始前のバリデーション結果。

```typescript
type TextInputValidationResult =
  | { ok: true }
  | { ok: false; reason: 'empty-text' | 'no-workspace'; message: string }
```

## FileLoadResult

ファイル読み込みの結果。

```typescript
type FileLoadResult =
  | { ok: true; text: string; fileName: string }
  | { ok: false; reason: 'unsupported-format' | 'read-error'; message: string }
```

## SceneDraftText（参照型）

U12-Cで定義される `SceneDraft` の一部として `draftText` フィールドを含む。U12-AはSceneDraftの `draftText` フィールドのみを読み書きし、他フィールドは変更しない。

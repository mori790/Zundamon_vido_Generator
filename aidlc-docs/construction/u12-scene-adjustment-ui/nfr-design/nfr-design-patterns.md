# NFR Design Patterns: U12-C シーン調整UI

## Fail-Open 保存パターン（Fail-Open Save Pattern、U12-A/B 継承）

完了ボタン押下時の SceneDraft 保存は非同期で行い、失敗してもタブ切り替えをブロックしない。

```typescript
async function handleConfirm() {
  setSaving(true);
  const finalScenes = finalizeScenes(editableScenes);

  // Fail-Open: 保存失敗は console.error のみ、onConfirm はブロックしない
  if (localApi && videoId) {
    const sceneDraft: SceneDraft = {
      draftText: initialDraftText,
      savedAt: new Date().toISOString(),
      scenes: finalScenes,
      segmentedAt: initialSegmentedAt,
    };
    localApi.draft.write(videoId, JSON.stringify(sceneDraft)).catch((err: unknown) => {
      console.error('[SceneListTab] SceneDraft save error', err);
    });
  }

  setSaving(false);
  onConfirm(finalScenes);
}
```

`setSaving(false)` はタブ切り替え前に呼ぶ（アンマウント前にフラグをリセット）。

## 保存中フラグパターン（Saving Flag Pattern）

`saving: boolean` 状態で完了ボタンの二重送信を防ぐ。

```typescript
const [saving, setSaving] = useState(false);

// 完了ボタン
<button
  disabled={editableScenes.length === 0 || saving}
  onClick={() => { void handleConfirm(); }}
>
  {saving ? '保存中...' : '完了'}
</button>
```

- `saving === true` の間は「完了」ボタンを disabled にし、ラベルを「保存中...」に変更する。
- `handleConfirm` 内で `setSaving(true)` → 処理 → `setSaving(false)` の順で管理する。
- `await localApi.draft.write(...)` を使わない（Fail-Open のため `.catch()` で非同期に流す）ので `setSaving(false)` は同期的に呼べる。

## ロジック抽出パターン（Logic Extraction Pattern）

シーン操作の純粋関数をすべて `src/studio/renderer/scene-editing.ts` に集約する。React / DOM に依存しない純粋 TypeScript とする。

```typescript
// src/studio/renderer/scene-editing.ts

export type EditableScene = Scene & {_key: string};

export function moveScene(scenes: EditableScene[], index: number, direction: 'up' | 'down'): EditableScene[] { ... }
export function addScene(scenes: EditableScene[]): EditableScene[] { ... }
export function removeScene(scenes: EditableScene[], index: number): EditableScene[] { ... }
export function updateSceneField(scenes: EditableScene[], index: number, field: 'title' | 'narration' | 'tags', value: string | string[]): EditableScene[] { ... }
export function finalizeScenes(scenes: EditableScene[]): Scene[] { ... }
export function parseTags(input: string): string[] { ... }
```

Vitest でのテストは `import` するだけで実行できる（DOM 不要）。

## アクセシビリティパターン（Accessibility Pattern）

アイコンボタンにはテキストラベルまたは `aria-label` を必ず付与する。境界インデックスで `disabled` を設定する。

```tsx
<button
  aria-label="上へ移動"
  disabled={index === 0}
  onClick={onMoveUp}
  type="button"
>▲</button>

<button
  aria-label="下へ移動"
  disabled={index === total - 1}
  onClick={onMoveDown}
  type="button"
>▼</button>

<button
  aria-label={`シーン${index + 1}を削除`}
  onClick={onRemove}
  type="button"
>削除</button>
```

`type="button"` を明示してフォーム内誤送信を防ぐ。

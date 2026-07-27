import {describe, expect, it} from 'vitest';
import {buildSegmentationPrompt, parseSegmentationResponse} from '../../src/studio/shared/scene-segmentation';

const VALID_JSON_RESPONSE = `以下のようにシーンに分割しました。

\`\`\`json
[
  {"title": "春の訪れ", "narration": "桜の花が咲き誇る季節がやってきました。", "tags": ["桜", "春", "明るい"]},
  {"title": "夏の思い出", "narration": "夏の海辺で波の音を聞きながら過ごしました。", "tags": ["海", "夏", "自然"]}
]
\`\`\``;

const VALID_RAW_JSON_RESPONSE = `[
  {"title": "冬の静寂", "narration": "雪が静かに降り積もる夜でした。", "tags": ["雪", "冬", "静か"]}
]`;

const INVALID_JSON_RESPONSE = `\`\`\`json
{this is not valid json}
\`\`\``;

const EMPTY_ARRAY_RESPONSE = `\`\`\`json
[]
\`\`\``;

const MISSING_FIELDS_RESPONSE = `\`\`\`json
[
  {"title": "タイトルのみ"},
  {}
]
\`\`\``;

const NON_ARRAY_RESPONSE = `\`\`\`json
{"title": "オブジェクト", "scenes": []}
\`\`\``;

describe('buildSegmentationPrompt', () => {
  it('draftText をプロンプトに含める', () => {
    const draftText = 'テスト用の草案テキストです。';
    const prompt = buildSegmentationPrompt(draftText);
    expect(prompt).toContain(draftText);
  });

  it('空文字でない文字列を返す', () => {
    const prompt = buildSegmentationPrompt('something');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('JSONフォーマット指示を含む', () => {
    const prompt = buildSegmentationPrompt('text');
    expect(prompt).toContain('```json');
    expect(prompt).toContain('narration');
    expect(prompt).toContain('tags');
  });
});

describe('parseSegmentationResponse', () => {
  it('JSONコードブロックを含む応答を正常に解析する', () => {
    const result = parseSegmentationResponse(VALID_JSON_RESPONSE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scenes).toHaveLength(2);
    expect(result.scenes[0].title).toBe('春の訪れ');
    expect(result.scenes[1].narration).toContain('夏の海辺');
  });

  it('コードブロックなしの生JSONを解析する', () => {
    const result = parseSegmentationResponse(VALID_RAW_JSON_RESPONSE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scenes).toHaveLength(1);
    expect(result.scenes[0].title).toBe('冬の静寂');
  });

  it('シーン ID が scene-001, scene-002 の形式になる', () => {
    const result = parseSegmentationResponse(VALID_JSON_RESPONSE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scenes[0].id).toBe('scene-001');
    expect(result.scenes[1].id).toBe('scene-002');
  });

  it('欠損フィールドをフォールバック値で補完する', () => {
    const result = parseSegmentationResponse(MISSING_FIELDS_RESPONSE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scenes).toHaveLength(2);
    expect(result.scenes[0].title).toBe('タイトルのみ');
    expect(result.scenes[0].narration).toBe('');
    expect(result.scenes[0].tags).toEqual([]);
    expect(result.scenes[1].title).toBe('');
    expect(result.scenes[1].narration).toBe('');
    expect(result.scenes[1].tags).toEqual([]);
  });

  it('不正な JSON で parse-error を返す', () => {
    const result = parseSegmentationResponse(INVALID_JSON_RESPONSE);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('parse-error');
  });

  it('空配列で empty-result を返す', () => {
    const result = parseSegmentationResponse(EMPTY_ARRAY_RESPONSE);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('empty-result');
  });

  it('配列でない JSON で parse-error を返す', () => {
    const result = parseSegmentationResponse(NON_ARRAY_RESPONSE);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('parse-error');
  });

  it('JSON を含まない応答で parse-error を返す', () => {
    const result = parseSegmentationResponse('シーン分割ができませんでした。');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('parse-error');
  });

  it('tags の非文字列要素をフィルタリングする', () => {
    const response = '```json\n[{"title": "t", "narration": "n", "tags": ["valid", 123, null, "also-valid"]}]\n```';
    const result = parseSegmentationResponse(response);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scenes[0].tags).toEqual(['valid', 'also-valid']);
  });
});

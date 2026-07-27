import type {TextInputDraft} from './text-input-draft';

export type Scene = {
  id: string;
  title: string;
  narration: string;
  tags: string[];
};

export type SceneDraft = TextInputDraft & {
  scenes: Scene[] | null;
  segmentedAt: string | null;
};

export type SegmentationErrorReason =
  | 'codex-not-connected'
  | 'codex-turn-active'
  | 'turn-failed'
  | 'parse-error'
  | 'empty-result'
  | 'timeout';

export type SegmentationResult =
  | {ok: true; scenes: Scene[]}
  | {ok: false; reason: SegmentationErrorReason; message: string};

export type SceneSegmentationApi = {
  segment(draftText: string, videoId: string): Promise<SegmentationResult>;
};

export type SceneWithAsset = Scene & {
  assetPublicPath: string | null;
  assetFileName: string | null;
};

export function buildSegmentationPrompt(draftText: string): string {
  return [
    '以下の草案テキストを動画のシーンに分割してください。',
    '',
    '草案テキスト:',
    '---',
    draftText,
    '---',
    '',
    '以下のJSON形式でのみ回答してください（コードブロックで囲んでください）:',
    '',
    '```json',
    '[',
    '  {',
    '    "title": "シーンのタイトル（簡潔に）",',
    '    "narration": "このシーンで読み上げるナレーションテキスト（句読点付きの完全な文章）",',
    '    "tags": ["推薦タグ"]',
    '  }',
    ']',
    '```',
    '',
    '分割の基準:',
    '- 意味のまとまり（段落・話題の転換）でシーンを区切る',
    '- narration は VOICEVOX で読み上げる実際のテキスト（草案の言葉を活かす）',
    '- tags は素材選定ヒントとなるキーワード（例: "桜", "春", "室内", "明るいBGM"）',
    '- 草案テキストの内容をすべてシーンでカバーする（省略しない）',
  ].join('\n');
}

export function parseSegmentationResponse(responseText: string): SegmentationResult {
  let jsonText: string | null = null;

  const codeBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  } else {
    const bracketStart = responseText.indexOf('[');
    const bracketEnd = responseText.lastIndexOf(']');
    if (bracketStart !== -1 && bracketEnd > bracketStart) {
      jsonText = responseText.slice(bracketStart, bracketEnd + 1);
    }
  }

  if (!jsonText) {
    return {ok: false, reason: 'parse-error', message: 'Codexの応答をシーンとして解析できませんでした。再試行してください。'};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {ok: false, reason: 'parse-error', message: 'Codexの応答をシーンとして解析できませんでした。再試行してください。'};
  }

  if (!Array.isArray(parsed)) {
    return {ok: false, reason: 'parse-error', message: 'Codexの応答をシーンとして解析できませんでした。再試行してください。'};
  }

  if (parsed.length === 0) {
    return {ok: false, reason: 'empty-result', message: 'シーンが生成されませんでした。草案テキストを確認して再試行してください。'};
  }

  const scenes: Scene[] = (parsed as unknown[]).map((item, index) => {
    const obj = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      id: `scene-${String(index + 1).padStart(3, '0')}`,
      title: typeof obj.title === 'string' ? obj.title : '',
      narration: typeof obj.narration === 'string' ? obj.narration : '',
      tags: Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === 'string') : [],
    };
  });

  return {ok: true, scenes};
}

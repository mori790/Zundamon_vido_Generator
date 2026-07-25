import {videoScriptSchema} from '../../schemas/video-script';
import type {Emotion, Scene, SceneType, VideoScript} from '../../types/video';

export type DraftStatus = 'none' | 'readonly-active' | 'draft' | 'invalid' | 'applied' | 'discarded';
export type DraftViewMode = 'raw' | 'structured';

export type DraftValidationIssue = {
  code: string;
  message: string;
  path?: string;
  sceneId?: string;
};

export type DraftValidationResult = {
  status: 'untested' | 'valid' | 'invalid';
  errors: DraftValidationIssue[];
};

export type ScriptDraft = {
  videoId: string;
  status: DraftStatus;
  rawJson: string;
  parsedScript: VideoScript | null;
  lastValidScript: VideoScript | null;
  validation: DraftValidationResult;
  updatedAt: string;
  generation: number;
};

export type ScenePatch = Partial<
  Pick<
    Scene,
    | 'id'
    | 'type'
    | 'text'
    | 'emotion'
    | 'characterVisible'
    | 'durationBeforeSpeech'
    | 'durationAfterSpeech'
  >
>;

export const sceneTypes: SceneType[] = ['title', 'explanation', 'code', 'summary', 'ending'];
export const emotions: Emotion[] = ['normal', 'happy', 'surprised', 'troubled'];

const validValidation: DraftValidationResult = {status: 'valid', errors: []};

export function formatScriptJson(script: VideoScript): string {
  return `${JSON.stringify(script, null, 2)}\n`;
}

export function createDraftFromScript(videoId: string, script: VideoScript): ScriptDraft {
  const parsedScript = normalizeScriptId(videoId, cloneScript(script));
  return {
    videoId,
    status: 'draft',
    rawJson: formatScriptJson(parsedScript),
    parsedScript,
    lastValidScript: parsedScript,
    validation: validValidation,
    updatedAt: new Date().toISOString(),
    generation: 0,
  };
}

export function createEmptyScriptDraft(videoId: string): ScriptDraft {
  return createDraftFromScript(videoId, createMinimalScript(videoId));
}

export function createMinimalScript(videoId: string): VideoScript {
  return {
    id: videoId,
    title: videoId,
    speaker: {
      engine: 'voicevox',
      speakerId: 3,
      speedScale: 1,
      pitchScale: 0,
      intonationScale: 1,
      volumeScale: 1,
    },
    video: {
      width: 1920,
      height: 1080,
      fps: 30,
      bgmVolume: 0.1,
    },
    subtitle: {
      enabled: true,
      maxCharactersPerLine: 24,
      maxLines: 2,
      fontSize: 56,
      bottom: 50,
      highlightKeywords: [],
    },
    scenes: [createScene('scene-001')],
  };
}

export function updateDraftRawJson(draft: ScriptDraft, rawJson: string): ScriptDraft {
  const generation = draft.generation + 1;
  const validation = validateRawScript(rawJson);
  if (validation.status === 'valid' && validation.script) {
    const parsedScript = normalizeScriptId(draft.videoId, validation.script);
    return {
      ...draft,
      status: 'draft',
      rawJson,
      parsedScript,
      lastValidScript: parsedScript,
      validation: validValidation,
      updatedAt: new Date().toISOString(),
      generation,
    };
  }

  if (validation.status === 'invalid') {
    return {
      ...draft,
      status: 'invalid',
      rawJson,
      parsedScript: null,
      validation: {
        status: 'invalid',
        errors: validation.errors,
      },
      updatedAt: new Date().toISOString(),
      generation,
    };
  }

  return draft;
}

export function updateDraftScene(draft: ScriptDraft, sceneId: string, patch: ScenePatch): ScriptDraft {
  const script = draft.lastValidScript;
  if (!script) {
    return draft;
  }

  const nextScript = {
    ...script,
    scenes: script.scenes.map((scene) => (scene.id === sceneId ? normalizeScene({...scene, ...patch}) : scene)),
  };
  return replaceDraftScript(draft, nextScript);
}

export function addDraftScene(draft: ScriptDraft, afterSceneId?: string): ScriptDraft {
  const script = draft.lastValidScript;
  if (!script) {
    return draft;
  }

  const nextScene = createScene(nextSceneId(script.scenes));
  const scenes = [...script.scenes];
  const insertAt = afterSceneId ? scenes.findIndex((scene) => scene.id === afterSceneId) + 1 : scenes.length;
  scenes.splice(insertAt > 0 ? insertAt : scenes.length, 0, nextScene);
  return replaceDraftScript(draft, {...script, scenes});
}

export function removeDraftScene(draft: ScriptDraft, sceneId: string): ScriptDraft {
  const script = draft.lastValidScript;
  if (!script || script.scenes.length <= 1) {
    return draft;
  }

  return replaceDraftScript(draft, {
    ...script,
    scenes: script.scenes.filter((scene) => scene.id !== sceneId),
  });
}

export function moveDraftScene(draft: ScriptDraft, sceneId: string, direction: 'up' | 'down'): ScriptDraft {
  const script = draft.lastValidScript;
  if (!script) {
    return draft;
  }

  const index = script.scenes.findIndex((scene) => scene.id === sceneId);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= script.scenes.length) {
    return draft;
  }

  const scenes = [...script.scenes];
  const [scene] = scenes.splice(index, 1);
  scenes.splice(targetIndex, 0, scene);
  return replaceDraftScript(draft, {...script, scenes});
}

export function validateRawScript(rawJson: string): {status: 'valid'; script: VideoScript} | {status: 'invalid'; errors: DraftValidationIssue[]} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    return {
      status: 'invalid',
      errors: [
        {
          code: 'invalid-json',
          message: error instanceof Error ? error.message : 'JSONの形式が不正です。',
        },
      ],
    };
  }

  const result = videoScriptSchema.safeParse(parsed);
  if (!result.success) {
    return {
      status: 'invalid',
      errors: result.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message,
        path: issue.path.join('.'),
        sceneId: extractSceneId(parsed, issue.path),
      })),
    };
  }

  return {status: 'valid', script: result.data};
}

export function nextSceneId(scenes: Scene[]): string {
  const used = new Set(scenes.map((scene) => scene.id));
  for (let index = 1; index < 1000; index += 1) {
    const candidate = `scene-${String(index).padStart(3, '0')}`;
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  return `scene-${Date.now()}`;
}

function replaceDraftScript(draft: ScriptDraft, script: VideoScript): ScriptDraft {
  const parsedScript = normalizeScriptId(draft.videoId, cloneScript(script));
  const rawJson = formatScriptJson(parsedScript);
  const validated = validateRawScript(rawJson);
  return {
    ...draft,
    status: validated.status === 'valid' ? 'draft' : 'invalid',
    rawJson,
    parsedScript: validated.status === 'valid' ? validated.script : null,
    lastValidScript: validated.status === 'valid' ? validated.script : draft.lastValidScript,
    validation: validated.status === 'valid' ? validValidation : {status: 'invalid', errors: validated.errors},
    updatedAt: new Date().toISOString(),
    generation: draft.generation + 1,
  };
}

function createScene(id: string): Scene {
  return {
    id,
    type: 'explanation',
    text: '新しいシーンなのだ。',
    emotion: 'normal',
    durationBeforeSpeech: 0.2,
    durationAfterSpeech: 0.3,
    characterVisible: true,
  };
}

function normalizeScene(scene: Scene): Scene {
  return {
    ...scene,
    text: scene.text,
    durationBeforeSpeech: Number(scene.durationBeforeSpeech),
    durationAfterSpeech: Number(scene.durationAfterSpeech),
    characterVisible: Boolean(scene.characterVisible),
  };
}

function normalizeScriptId(videoId: string, script: VideoScript): VideoScript {
  return {...script, id: videoId};
}

function cloneScript(script: VideoScript): VideoScript {
  return JSON.parse(JSON.stringify(script)) as VideoScript;
}

function extractSceneId(parsed: unknown, path: Array<string | number>): string | undefined {
  if (path[0] !== 'scenes' || typeof path[1] !== 'number') {
    return undefined;
  }
  const scenes = (parsed as {scenes?: unknown}).scenes;
  if (!Array.isArray(scenes)) {
    return undefined;
  }
  const scene = scenes[path[1]] as {id?: unknown} | undefined;
  return typeof scene?.id === 'string' ? scene.id : undefined;
}

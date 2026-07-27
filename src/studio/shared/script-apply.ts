import type {VideoScript} from '../../types/video';
import {formatScriptJson, validateRawScript, type DraftValidationIssue} from './script-draft';

export type ScriptFileAccess = {
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
};

export type ScriptApplyResult =
  | {
      status: 'applied';
      script: VideoScript;
      scriptPath: string;
      backupPath: string;
    }
  | {
      status: 'failed';
      error: ScriptApplyIssue;
    };

export type ScriptApplyIssue =
  | DraftValidationIssue
  | {
      code: 'backup-failed' | 'save-failed';
      message: string;
      targetPath: string;
    };

export function scriptPathFor(videoId: string): string {
  return `input/${videoId}.json`;
}

export function backupPathFor(videoId: string): string {
  return `input/${videoId}.json.bak`;
}

export async function applyScriptDraft(
  videoId: string,
  rawJson: string,
  fileAccess: ScriptFileAccess,
): Promise<ScriptApplyResult> {
  const validation = validateRawScript(rawJson);
  if (validation.status === 'invalid') {
    return {
      status: 'failed',
      error: validation.errors[0] ?? {
        code: 'invalid-draft',
        message: '下書きJSONが無効です。',
      },
    };
  }

  const script: VideoScript = {...validation.script, id: videoId};
  const scriptPath = scriptPathFor(videoId);
  const backupPath = backupPathFor(videoId);
  const formatted = formatScriptJson(script);

  try {
    const current = await fileAccess.readFile(scriptPath).catch((error) => {
      const nodeError = error as {code?: string};
      if (nodeError.code === 'ENOENT') {
        return formatted;
      }
      throw error;
    });
    await fileAccess.writeFile(backupPath, current);
  } catch (error) {
    return {
      status: 'failed',
      error: {
        code: 'backup-failed',
        message: error instanceof Error ? error.message : 'バックアップの作成に失敗しました。',
        targetPath: backupPath,
      },
    };
  }

  try {
    await fileAccess.writeFile(scriptPath, formatted);
  } catch (error) {
    return {
      status: 'failed',
      error: {
        code: 'save-failed',
        message: error instanceof Error ? error.message : '正式JSONの保存に失敗しました。',
        targetPath: scriptPath,
      },
    };
  }

  return {
    status: 'applied',
    script,
    scriptPath,
    backupPath,
  };
}

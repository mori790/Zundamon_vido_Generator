import type {VideoScript} from '../../types/video';
import {z} from 'zod';

export const workspaceReferenceSchema = z.object({
  schemaVersion: z.literal(1),
  root: z.string().min(1),
});

export type WorkspaceReference = z.infer<typeof workspaceReferenceSchema>;
export type ProjectRootStatus = 'unconfigured' | 'ready' | 'missing' | 'denied' | 'invalid';
export type ProjectRootState = {
  status: ProjectRootStatus;
  root?: string;
  reason?: string;
};

export type WorkspaceRootApi = {
  get(): Promise<ProjectRootState>;
  select(): Promise<ProjectRootState>;
  clear(): Promise<void>;
};

export function normalizeWorkspaceReference(value: WorkspaceReference): WorkspaceReference {
  return {schemaVersion: 1, root: value.root.trim()};
}

export function parseWorkspaceReference(value: unknown): WorkspaceReference {
  return normalizeWorkspaceReference(workspaceReferenceSchema.parse(value));
}

export type VideoProjectSummary = {
  videoId: string;
  fileName: string;
  filePath: string;
  lastModifiedAt?: string;
};

export type WorkspaceMode = 'existing-script' | 'empty-draft';

export type WorkspaceErrorCode = 'invalid-video-id' | 'invalid-script' | 'file-system-error';

export type WorkspaceError = {
  code: WorkspaceErrorCode;
  message: string;
  targetPath?: string;
};

export type WorkspaceState = {
  videoId: string;
  mode: WorkspaceMode;
  activeScript: VideoScript | null;
  error: WorkspaceError | null;
};

export type WorkspaceOpenResult =
  | {status: 'opened'; workspace: WorkspaceState}
  | {status: 'failed'; error: WorkspaceError};

export function normalizeVideoId(input: string): string {
  return input.trim();
}

export function validateVideoId(input: string): WorkspaceError | null {
  const videoId = normalizeVideoId(input);
  if (!videoId) {
    return {
      code: 'invalid-video-id',
      message: '動画IDを入力してください。',
    };
  }

  if (videoId.includes('/') || videoId.includes('\\') || videoId.includes('..')) {
    return {
      code: 'invalid-video-id',
      message: '動画IDに使用できない文字が含まれています。',
    };
  }

  return null;
}

export function createExistingWorkspace(videoId: string, activeScript: VideoScript): WorkspaceState {
  return {
    videoId,
    mode: 'existing-script',
    activeScript,
    error: null,
  };
}

export function createEmptyDraftWorkspace(videoId: string): WorkspaceState {
  return {
    videoId,
    mode: 'empty-draft',
    activeScript: null,
    error: null,
  };
}

export function createInvalidScriptError(targetPath: string, message = '台本JSONを読み込めませんでした。'): WorkspaceError {
  return {
    code: 'invalid-script',
    message,
    targetPath,
  };
}

export function createFileSystemError(targetPath: string, message = 'ファイル操作に失敗しました。'): WorkspaceError {
  return {
    code: 'file-system-error',
    message,
    targetPath,
  };
}

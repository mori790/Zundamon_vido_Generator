export type AppErrorCode =
  | 'SCRIPT_NOT_FOUND'
  | 'SCRIPT_VALIDATION_FAILED'
  | 'ASSET_NOT_FOUND'
  | 'VOICEVOX_CONNECTION_FAILED'
  | 'VOICEVOX_SYNTHESIS_FAILED'
  | 'AUDIO_DURATION_FAILED'
  | 'TIMELINE_GENERATION_FAILED'
  | 'RENDER_FAILED';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly videoId?: string;
  readonly sceneId?: string;
  readonly targetPath?: string;
  readonly cause?: unknown;

  constructor(params: {
    code: AppErrorCode;
    message: string;
    videoId?: string;
    sceneId?: string;
    targetPath?: string;
    cause?: unknown;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.videoId = params.videoId;
    this.sceneId = params.sceneId;
    this.targetPath = params.targetPath;
    this.cause = params.cause;
  }
}

export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    const details = [
      error.sceneId ? `シーン: ${error.sceneId}` : undefined,
      error.targetPath ? `対象: ${error.targetPath}` : undefined,
    ].filter(Boolean);
    return [error.message, ...details].join('\n');
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function formatVerboseCause(error: unknown): string | null {
  if (!(error instanceof AppError) || !error.cause) {
    return null;
  }

  if (error.cause instanceof Error) {
    return error.cause.stack ?? error.cause.message;
  }

  return String(error.cause);
}

import type {ZundamonCompositionProps} from '../../types/video';
import type {CommandType} from './command';

export type PreviewSource = {
  videoId: string;
  scriptModifiedAt: number | null;
  manifestModifiedAt: number | null;
  timelineModifiedAt: number | null;
  width?: number;
  height?: number;
  fps?: number;
  totalFrames?: number;
};

export type PreviewReadiness = {
  ready: boolean;
  missing: Array<'script' | 'manifest' | 'timeline'>;
  stale: Array<'manifest' | 'timeline'>;
  requiredOperations: Array<Extract<CommandType, 'voice' | 'timeline'>>;
  capacityWarning?: string;
};

export type PreviewSnapshot = {
  source: PreviewSource;
  readiness: PreviewReadiness;
};

export type PreviewLoadResult = PreviewSnapshot & {
  inputProps: ZundamonCompositionProps;
};

export type PreviewApi = {
  check(videoId: string): Promise<PreviewSnapshot>;
  load(videoId: string): Promise<PreviewLoadResult>;
};

export function assessPreview(source: PreviewSource): PreviewReadiness {
  const missing: PreviewReadiness['missing'] = [];
  const stale: PreviewReadiness['stale'] = [];
  if (source.scriptModifiedAt === null) missing.push('script');
  if (source.manifestModifiedAt === null) missing.push('manifest');
  if (source.timelineModifiedAt === null) missing.push('timeline');

  if (
    source.scriptModifiedAt !== null
    && source.manifestModifiedAt !== null
    && source.manifestModifiedAt < source.scriptModifiedAt
  ) {
    stale.push('manifest');
  }
  if (
    source.timelineModifiedAt !== null
    && Math.max(source.scriptModifiedAt ?? 0, source.manifestModifiedAt ?? 0) > source.timelineModifiedAt
  ) {
    stale.push('timeline');
  }

  const requiredOperations: PreviewReadiness['requiredOperations'] = [];
  if (missing.includes('manifest') || stale.includes('manifest')) requiredOperations.push('voice');
  if (
    missing.includes('timeline')
    || stale.includes('timeline')
    || requiredOperations.includes('voice')
  ) {
    requiredOperations.push('timeline');
  }

  const duration = source.fps && source.totalFrames ? source.totalFrames / source.fps : 0;
  const capacityWarning = (
    (source.width ?? 0) > 1920
    || (source.height ?? 0) > 1080
    || (source.fps ?? 0) > 30
    || duration > 1800
  )
    ? '推奨上限（1920×1080、30fps、30分）を超えているため、プレビューが重くなる場合があります。'
    : undefined;

  return {
    ready: missing.length === 0 && stale.length === 0,
    missing,
    stale,
    requiredOperations,
    capacityWarning,
  };
}

export function createLatestQueuedRunner(task: () => Promise<void>): {
  run(): Promise<void>;
  dispose(): void;
} {
  let running: Promise<void> | null = null;
  let queued = false;
  let disposed = false;

  async function execute(): Promise<void> {
    do {
      queued = false;
      await task();
    } while (queued && !disposed);
  }

  return {
    run() {
      if (disposed) return Promise.resolve();
      if (running) {
        queued = true;
        return running;
      }
      running = execute().finally(() => {
        running = null;
      });
      return running;
    },
    dispose() {
      disposed = true;
      queued = false;
    },
  };
}

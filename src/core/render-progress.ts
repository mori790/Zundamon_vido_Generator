import type {RenderProgress} from '../studio/shared/command';

export function createRenderProgressReporter(
  totalFrames: number,
  emit: (progress: RenderProgress) => void,
  now = Date.now,
  throttleMs = 250,
): (renderedFrames: number, fraction: number) => void {
  const startedAt = now();
  let lastAt = -Infinity;
  let lastFraction = 0;

  return (renderedFrames, rawFraction) => {
    const fraction = Math.max(lastFraction, Math.min(1, Math.max(0, rawFraction)));
    const timestamp = now();
    if (fraction < 1 && timestamp - lastAt < throttleMs) return;
    lastAt = timestamp;
    lastFraction = fraction;
    const elapsedSeconds = Math.max(0, timestamp - startedAt) / 1000;
    const etaSeconds = fraction > 0 && fraction < 1
      ? elapsedSeconds * (1 - fraction) / fraction
      : undefined;
    emit({
      renderedFrames: Math.max(0, Math.min(totalFrames, Math.round(renderedFrames))),
      totalFrames,
      fraction,
      etaSeconds,
    });
  };
}

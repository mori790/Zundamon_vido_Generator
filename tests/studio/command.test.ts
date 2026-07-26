import {describe, expect, it} from 'vitest';
import {
  appendLog,
  parseRenderProgress,
  serializeRenderProgress,
  terminalOperationStatuses,
  type LogEntry,
} from '../../src/studio/shared/command';

describe('command shared model', () => {
  it('keeps only the newest log entries', () => {
    const entries = Array.from({length: 3}, (_, index): LogEntry => ({
      operationId: 'op',
      sequence: index + 1,
      timestamp: '2026-07-26T00:00:00.000Z',
      source: 'stdout',
      text: String(index + 1),
    }));
    const logs = entries.reduce((current, entry) => appendLog(current, entry, 2), [] as LogEntry[]);
    expect(logs.map((entry) => entry.text)).toEqual(['2', '3']);
  });

  it('recognizes terminal operation statuses', () => {
    expect(terminalOperationStatuses.has('succeeded')).toBe(true);
    expect(terminalOperationStatuses.has('running')).toBe(false);
  });

  it('round-trips valid render progress and rejects malformed records', () => {
    const progress = {renderedFrames: 30, totalFrames: 100, fraction: 0.3, etaSeconds: 7};
    expect(parseRenderProgress(serializeRenderProgress(progress))).toEqual(progress);
    expect(parseRenderProgress('__ZUNDAMON_RENDER_PROGRESS__{"fraction":2}')).toBeNull();
    expect(parseRenderProgress('ordinary log')).toBeNull();
  });
});

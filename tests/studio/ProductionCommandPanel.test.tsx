import '@testing-library/jest-dom/vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ProductionCommandPanel} from '../../src/studio/renderer/ProductionCommandPanel';
import type {CommandApi, LogEntry, Operation} from '../../src/studio/shared/command';

const running: Operation = {
  id: 'op-1',
  videoId: 'sample-video',
  command: 'voice',
  phase: 'command',
  status: 'running',
  startedAt: '2026-07-26T00:00:00.000Z',
};

describe('ProductionCommandPanel', () => {
  afterEach(() => {
    delete globalThis.commandApi;
    delete globalThis.previewApi;
    delete globalThis.renderOutputApi;
  });

  it('starts an allowlisted command and disables conflicting actions', async () => {
    globalThis.commandApi = api({start: vi.fn().mockResolvedValue(running)});
    render(<ProductionCommandPanel videoId="sample-video" />);
    fireEvent.click(screen.getByTestId('command-voice-button'));
    await waitFor(() => expect(screen.getByTestId('command-status')).toHaveTextContent('running'));
    expect(screen.getByTestId('command-render-button')).toBeDisabled();
    expect(globalThis.commandApi.start).toHaveBeenCalledWith({videoId: 'sample-video', command: 'voice'});
  });

  it('shows streamed logs and clears them', async () => {
    let logListener: ((entry: LogEntry) => void) | undefined;
    const clearLogs = vi.fn().mockResolvedValue(true);
    globalThis.commandApi = api({
      clearLogs,
      onLog(listener) {
        logListener = listener;
        return () => undefined;
      },
    });
    render(<ProductionCommandPanel videoId="sample-video" />);
    logListener?.({
      operationId: 'op-1',
      sequence: 1,
      timestamp: '2026-07-26T00:00:00.000Z',
      source: 'stdout',
      text: 'hello',
    });
    expect(await screen.findByText(/hello/)).toBeInTheDocument();
  });

  it('blocks render when artifacts are not ready', async () => {
    globalThis.commandApi = api();
    globalThis.previewApi = {
      check: vi.fn().mockResolvedValue({
        source: {},
        readiness: {
          ready: false,
          missing: ['timeline'],
          stale: [],
          requiredOperations: ['timeline'],
        },
      }),
      load: vi.fn(),
    } as never;
    render(<ProductionCommandPanel videoId="sample-video" />);
    fireEvent.click(screen.getByTestId('command-render-button'));
    expect(await screen.findByTestId('command-error')).toHaveTextContent('timeline');
    expect(globalThis.commandApi.start).not.toHaveBeenCalled();
  });

  it('confirms overwrite, displays progress, and reveals verified output', async () => {
    let operationListener: ((operation: Operation) => void) | undefined;
    const renderRunning = {...running, command: 'render' as const};
    globalThis.commandApi = api({
      start: vi.fn().mockResolvedValue(renderRunning),
      onOperation(listener) {
        operationListener = listener;
        return () => undefined;
      },
    });
    globalThis.previewApi = {
      check: vi.fn().mockResolvedValue({
        source: {},
        readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
      }),
      load: vi.fn(),
    } as never;
    const reveal = vi.fn().mockResolvedValue(true);
    globalThis.renderOutputApi = {
      status: vi.fn()
        .mockResolvedValueOnce({videoId: 'sample-video', outputPath: 'output/sample-video.mp4', exists: true, nonZero: true})
        .mockResolvedValueOnce({videoId: 'sample-video', outputPath: 'output/sample-video.mp4', exists: true, nonZero: true}),
      confirmOverwrite: vi.fn().mockResolvedValue(true),
      reveal,
    };
    render(<ProductionCommandPanel videoId="sample-video" />);
    fireEvent.click(screen.getByTestId('command-render-button'));
    await waitFor(() => expect(globalThis.commandApi?.start).toHaveBeenCalled());
    act(() => {
      operationListener?.({
        ...renderRunning,
        progress: {renderedFrames: 50, totalFrames: 100, fraction: 0.5, etaSeconds: 61},
      });
    });
    expect(await screen.findByTestId('command-render-progress')).toHaveTextContent('50%');
    expect(screen.getByTestId('command-render-progress')).toHaveTextContent('1分1秒');
    act(() => operationListener?.({...renderRunning, status: 'succeeded', endedAt: ''}));
    expect(await screen.findByTestId('command-render-result')).toHaveTextContent('output/sample-video.mp4');
    fireEvent.click(screen.getByTestId('command-render-reveal-button'));
    expect(reveal).toHaveBeenCalledWith('sample-video');
  });

  it('does not start render when native overwrite confirmation is cancelled', async () => {
    globalThis.commandApi = api();
    globalThis.previewApi = {
      check: vi.fn().mockResolvedValue({
        source: {},
        readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
      }),
      load: vi.fn(),
    } as never;
    globalThis.renderOutputApi = {
      status: vi.fn().mockResolvedValue({videoId: 'sample-video', outputPath: '', exists: true, nonZero: true}),
      confirmOverwrite: vi.fn().mockResolvedValue(false),
      reveal: vi.fn(),
    };
    render(<ProductionCommandPanel videoId="sample-video" />);
    fireEvent.click(screen.getByTestId('command-render-button'));
    expect(await screen.findByTestId('command-error')).toHaveTextContent('キャンセル');
    expect(globalThis.commandApi.start).not.toHaveBeenCalled();
  });

  it('warns that failed render partial output is preserved', async () => {
    let operationListener: ((operation: Operation) => void) | undefined;
    globalThis.commandApi = api({
      onOperation(listener) {
        operationListener = listener;
        return () => undefined;
      },
    });
    render(<ProductionCommandPanel videoId="sample-video" />);
    act(() => operationListener?.({
      ...running,
      command: 'render',
      status: 'failed',
      failure: 'output-verification-failed',
    }));
    expect(await screen.findByTestId('command-partial-output-warning')).toHaveTextContent('自動削除されません');
    expect(screen.getByTestId('command-render-button')).not.toBeDisabled();
  });
});

function api(overrides: Partial<CommandApi> = {}): CommandApi {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    clearLogs: vi.fn(),
    snapshot: vi.fn().mockResolvedValue({operation: null, logs: []}),
    onOperation: vi.fn(() => () => undefined),
    onLog: vi.fn(() => () => undefined),
    ...overrides,
  };
}

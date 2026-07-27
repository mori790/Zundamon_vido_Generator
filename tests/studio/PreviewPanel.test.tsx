import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {PreviewPanel} from '../../src/studio/renderer/PreviewPanel';
import {PreviewCoordinator} from '../../src/studio/renderer/preview-coordinator';
import type {PreviewApi, PreviewLoadResult} from '../../src/studio/shared/preview';

vi.mock('@remotion/player', () => ({
  Player: ({controls}: {controls: boolean}) => <div data-testid="mock-remotion-player">{controls ? 'controls' : ''}</div>,
}));

const result = {
  source: {
    videoId: 'sample-video',
    scriptModifiedAt: 1,
    manifestModifiedAt: 2,
    timelineModifiedAt: 3,
  },
  readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
  inputProps: {
    script: {video: {width: 1920, height: 1080, fps: 30}},
    timeline: {totalFrames: 300},
    manifest: {},
  },
} as unknown as PreviewLoadResult;

describe('PreviewPanel', () => {
  it('shows states and lazy-loads the controlled Player only when opened', async () => {
    const coordinator = readyCoordinator();
    render(<PreviewPanel coordinator={coordinator} runFallback={vi.fn()} />);
    expect(screen.queryByTestId('mock-remotion-player')).not.toBeInTheDocument();
    await screen.findByText('プレビュー準備完了');
    fireEvent.click(screen.getByTestId('preview-open-button'));
    expect(await screen.findByTestId('mock-remotion-player')).toHaveTextContent('controls');
  });

  it('shows capacity warnings', async () => {
    const coordinator = readyCoordinator({
      ...result,
      readiness: {...result.readiness, capacityWarning: '推奨上限を超えています。'},
    });
    render(<PreviewPanel coordinator={coordinator} runFallback={vi.fn()} />);
    expect(await screen.findByTestId('preview-capacity-warning')).toHaveTextContent('推奨上限');
  });

  it('retries errors and starts the fallback command', async () => {
    const check = vi.fn().mockRejectedValue(new Error('broken'));
    const coordinator = new PreviewCoordinator(
      'sample-video',
      {check, load: vi.fn()} as unknown as PreviewApi,
      vi.fn(),
    );
    const fallback = vi.fn();
    render(<PreviewPanel coordinator={coordinator} runFallback={fallback} />);
    expect(await screen.findByTestId('preview-error')).toHaveTextContent('broken');
    fireEvent.click(screen.getByText('再試行'));
    await waitFor(() => expect(check).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByText('Remotion Studioで開く'));
    expect(fallback).toHaveBeenCalledWith('preview');
  });
});

function readyCoordinator(loadResult: PreviewLoadResult = result): PreviewCoordinator {
  const api = {
    check: vi.fn().mockResolvedValue({source: loadResult.source, readiness: loadResult.readiness}),
    load: vi.fn().mockResolvedValue(loadResult),
  } as PreviewApi;
  return new PreviewCoordinator('sample-video', api, vi.fn());
}

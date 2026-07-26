import {Component, lazy, Suspense, useEffect, useState, type ComponentType, type ErrorInfo, type ReactNode} from 'react';
import {ZundamonVideo} from '../../compositions/ZundamonVideo';
import type {CommandType} from '../shared/command';
import {PreviewCoordinator, type PreviewState} from './preview-coordinator';

const RemotionPlayer = lazy(() => import('@remotion/player').then(({Player}) => ({default: Player})));

export function PreviewPanel({
  coordinator,
  runFallback,
}: {
  coordinator: PreviewCoordinator;
  runFallback(command: Extract<CommandType, 'preview'>): void;
}): JSX.Element {
  const [state, setState] = useState<PreviewState>(coordinator.getState());
  const [open, setOpen] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);

  useEffect(() => {
    const unsubscribe = coordinator.subscribe(setState);
    void coordinator.refresh();
    return unsubscribe;
  }, [coordinator]);

  const warning = state.status === 'ready'
    ? state.result.readiness.capacityWarning
    : state.snapshot?.readiness.capacityWarning;

  return (
    <section className="preview-panel" data-testid="preview-panel">
      <header className="preview-panel-header">
        <div>
          <h2>Preview</h2>
          <p data-testid="preview-status" role="status">{statusText(state)}</p>
        </div>
        <button
          data-testid="preview-open-button"
          disabled={state.status !== 'ready'}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? '閉じる' : '開く'}
        </button>
      </header>
      {warning ? <p className="preview-warning" data-testid="preview-capacity-warning">{warning}</p> : null}
      {state.status === 'error' ? (
        <div className="preview-error" data-testid="preview-error">
          <p>{state.message}</p>
          <button onClick={() => void coordinator.refresh()} type="button">再試行</button>
          <button onClick={() => runFallback('preview')} type="button">Remotion Studioで開く</button>
        </div>
      ) : null}
      {open && state.status === 'ready' ? (
        <PreviewErrorBoundary
          key={boundaryKey}
          fallback={
            <div className="preview-error" data-testid="preview-player-error">
              <p>埋め込みPlayerを表示できませんでした。</p>
              <button onClick={() => setBoundaryKey((key) => key + 1)} type="button">再試行</button>
              <button onClick={() => runFallback('preview')} type="button">Remotion Studioで開く</button>
            </div>
          }
        >
          <div aria-label="動画プレビュー" className="preview-player" data-testid="preview-player">
            <Suspense fallback={<p role="status">Playerを読み込み中...</p>}>
              <RemotionPlayer
                clickToPlay
                component={ZundamonVideo as ComponentType<Record<string, unknown>>}
                compositionHeight={state.result.inputProps.script.video.height}
                compositionWidth={state.result.inputProps.script.video.width}
                controls
                doubleClickToFullscreen
                durationInFrames={state.result.inputProps.timeline.totalFrames}
                fps={state.result.inputProps.script.video.fps}
                inputProps={state.result.inputProps as unknown as Record<string, unknown>}
                style={{width: '100%'}}
              />
            </Suspense>
          </div>
        </PreviewErrorBoundary>
      ) : null}
    </section>
  );
}

function statusText(state: PreviewState): string {
  if (state.status === 'checking') return 'プレビューを確認中...';
  if (state.status === 'generating') return `${state.command}を生成中...`;
  if (state.status === 'ready') return 'プレビュー準備完了';
  if (state.status === 'error') return 'プレビューを準備できませんでした';
  return 'プレビュー待機中';
}

class PreviewErrorBoundary extends Component<{children: ReactNode; fallback: ReactNode}, {failed: boolean}> {
  state = {failed: false};

  static getDerivedStateFromError(): {failed: boolean} {
    return {failed: true};
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // The visible fallback keeps Player failures isolated from the workspace.
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

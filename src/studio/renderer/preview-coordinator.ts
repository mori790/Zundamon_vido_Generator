import type {Operation} from '../shared/command';
import {
  createLatestQueuedRunner,
  type PreviewApi,
  type PreviewLoadResult,
  type PreviewSnapshot,
} from '../shared/preview';

export type PreviewState =
  | {status: 'idle' | 'checking'; snapshot?: PreviewSnapshot}
  | {status: 'generating'; command: 'voice' | 'timeline'; snapshot: PreviewSnapshot}
  | {status: 'ready'; result: PreviewLoadResult}
  | {status: 'error'; message: string; snapshot?: PreviewSnapshot};

export class PreviewCoordinator {
  private state: PreviewState = {status: 'idle'};
  private readonly listeners = new Set<(state: PreviewState) => void>();
  private readonly runner;
  private disposed = false;

  constructor(
    private readonly videoId: string,
    private readonly api: PreviewApi,
    private readonly runCommand: (command: 'voice' | 'timeline') => Promise<Operation>,
  ) {
    this.runner = createLatestQueuedRunner(() => this.refreshNow());
  }

  getState = (): PreviewState => this.state;

  subscribe = (listener: (state: PreviewState) => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  refresh = (): Promise<void> => this.runner.run();

  dispose(): void {
    this.disposed = true;
    this.runner.dispose();
    this.listeners.clear();
  }

  private publish(state: PreviewState): void {
    if (this.disposed) return;
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  private async refreshNow(): Promise<void> {
    this.publish({status: 'checking'});
    let snapshot: PreviewSnapshot | undefined;
    try {
      snapshot = await this.api.check(this.videoId);
      for (const command of snapshot.readiness.requiredOperations) {
        this.publish({status: 'generating', command, snapshot});
        const operation = await this.runCommand(command);
        if (operation.status !== 'succeeded') {
          throw new Error(operation.error ?? `${command}に失敗しました。`);
        }
      }
      if (snapshot.readiness.requiredOperations.length > 0) {
        snapshot = await this.api.check(this.videoId);
      }
      if (!snapshot.readiness.ready) {
        throw new Error('プレビュー用データを準備できませんでした。');
      }
      this.publish({status: 'ready', result: await this.api.load(this.videoId)});
    } catch (error) {
      this.publish({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        snapshot,
      });
    }
  }
}

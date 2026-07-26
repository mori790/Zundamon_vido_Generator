import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {commandClient} from './command-client';
import {previewClient} from './preview-client';
import {renderClient} from './render-client';
import {appendLog, terminalOperationStatuses, type CommandType, type LogEntry, type Operation} from '../shared/command';
import type {RenderOutputStatus} from '../shared/render';

const commands: Array<{type: CommandType; label: string}> = [
  {type: 'validate', label: 'Validate'},
  {type: 'voice', label: 'Voice'},
  {type: 'timeline', label: 'Timeline'},
  {type: 'preview', label: 'Preview'},
  {type: 'render', label: 'Render'},
];

export type ProductionCommandPanelHandle = {
  start(command: CommandType): Promise<Operation>;
  run(command: CommandType): Promise<Operation>;
};

type Props = {
  videoId: string;
  onOperationFinished?(operation: Operation): void;
};

export const ProductionCommandPanel = forwardRef<ProductionCommandPanelHandle, Props>(
  function ProductionCommandPanel({videoId, onOperationFinished}, ref): JSX.Element {
    const [operation, setOperation] = useState<Operation | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [renderOutput, setRenderOutput] = useState<RenderOutputStatus | null>(null);
    const pendingLogs = useRef<LogEntry[]>([]);
    const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const logEnd = useRef<HTMLDivElement>(null);
    const waiters = useRef(new Map<string, (operation: Operation) => void>());

    async function start(command: CommandType): Promise<Operation> {
      setError(null);
      if (command === 'render') {
        const preview = await previewClient.check(videoId);
        if (!preview.readiness.ready) {
          const required = preview.readiness.requiredOperations.join(' → ') || preview.readiness.missing.join(', ');
          throw new Error(`Render準備が未完了です。必要な操作: ${required}`);
        }
        const output = await renderClient.status(videoId);
        if (output.exists && !(await renderClient.confirmOverwrite(videoId))) {
          throw new Error('Renderをキャンセルしました。');
        }
        setRenderOutput(null);
      }
      const started = await commandClient.start({videoId, command});
      setOperation(started);
      setLogs([]);
      return started;
    }

    async function run(command: CommandType): Promise<Operation> {
      const started = await start(command);
      return new Promise((resolve) => waiters.current.set(started.id, resolve));
    }

    useImperativeHandle(ref, () => ({run, start}));

    useEffect(() => {
      let active = true;
      void commandClient.snapshot().then((snapshot) => {
        if (active) {
          setOperation(snapshot.operation);
          setLogs(snapshot.logs);
        }
      });
      const removeOperation = commandClient.onOperation((next) => {
        setOperation(next);
        if (terminalOperationStatuses.has(next.status)) {
          if (next.command === 'render') {
            if (next.status === 'succeeded') {
              void renderClient.status(videoId).then(setRenderOutput).catch((caught) => setError(message(caught)));
            } else {
              setRenderOutput(null);
            }
          }
          waiters.current.get(next.id)?.(next);
          waiters.current.delete(next.id);
          onOperationFinished?.(next);
        }
      });
      const removeLog = commandClient.onLog((entry) => {
        pendingLogs.current.push(entry);
        if (!flushTimer.current) {
          flushTimer.current = setTimeout(() => {
            const entries = pendingLogs.current.splice(0);
            setLogs((current) => entries.reduce((next, item) => appendLog(next, item), current));
            flushTimer.current = null;
          }, 50);
        }
      });
      return () => {
        active = false;
        removeOperation();
        removeLog();
        if (flushTimer.current) {
          clearTimeout(flushTimer.current);
        }
      };
    }, [onOperationFinished]);

    useEffect(() => {
      if (typeof logEnd.current?.scrollIntoView === 'function') {
        logEnd.current.scrollIntoView({block: 'nearest'});
      }
    }, [logs]);

    const busy = operation ? !terminalOperationStatuses.has(operation.status) : false;
    const hint = recoveryHint(operation, logs);

    return (
      <section className="command-panel" data-testid="production-command-panel">
        <header className="command-panel-header">
          <div>
            <h2>Production</h2>
            <p>保存済みの台本に対して既存npm pipelineを実行します。</p>
          </div>
          <strong data-testid="command-status">{operation?.status ?? 'idle'}</strong>
        </header>
        <div className="command-actions">
          {commands.map(({type, label}) => (
            <button
              data-testid={`command-${type}-button`}
              disabled={busy}
              key={type}
              onClick={() => void start(type).catch((caught) => setError(message(caught)))}
              type="button"
            >
              {label}
            </button>
          ))}
          <button
            data-testid="command-stop-button"
            disabled={!busy || operation?.status === 'stopping'}
            onClick={() => operation && void commandClient.stop(operation.id)}
            type="button"
          >
            Stop
          </button>
          <button
            data-testid="command-clear-logs-button"
            disabled={!operation}
            onClick={() => {
              if (operation) {
                void commandClient.clearLogs(operation.id).then((cleared) => cleared && setLogs([]));
              }
            }}
            type="button"
          >
            Clear Logs
          </button>
        </div>
        {operation ? (
          <p className="command-operation" data-testid="command-operation">
            {operation.command} / {operation.phase}
          </p>
        ) : null}
        {operation?.command === 'render' && operation.progress ? (
          <p className="command-progress" data-testid="command-render-progress" role="status">
            Render {Math.round(operation.progress.fraction * 100)}%
            {operation.progress.etaSeconds === undefined ? '' : ` / 残り約${formatEta(operation.progress.etaSeconds)}`}
          </p>
        ) : null}
        {error || operation?.error ? (
          <p className="command-error" data-testid="command-error">{error ?? operation?.error}</p>
        ) : null}
        {hint ? <p className="command-hint" data-testid="command-recovery-hint">{hint}</p> : null}
        {operation?.command === 'render' && (operation.status === 'failed' || operation.status === 'cancelled') ? (
          <p className="command-hint" data-testid="command-partial-output-warning">
            Partial outputが残っている場合があります。自動削除されません。
          </p>
        ) : null}
        {renderOutput?.nonZero ? (
          <div className="command-result" data-testid="command-render-result">
            <code>{renderOutput.outputPath}</code>
            <button
              data-testid="command-render-reveal-button"
              onClick={() => void renderClient.reveal(videoId).catch((caught) => setError(message(caught)))}
              type="button"
            >
              Finderで表示
            </button>
          </div>
        ) : null}
        <div className="command-logs" data-testid="command-log-panel" role="log">
          {logs.map((entry) => (
            <div className={`command-log ${entry.source}`} key={`${entry.operationId}-${entry.sequence}`}>
              <span>{entry.source}</span> {entry.text}
            </div>
          ))}
          <div ref={logEnd} />
        </div>
      </section>
    );
  },
);

function recoveryHint(operation: Operation | null, logs: LogEntry[]): string | null {
  if (operation?.status !== 'failed') {
    return null;
  }
  const text = logs.map((entry) => entry.text).join('\n');
  if (operation.command === 'voice' && /VOICEVOX|ECONNREFUSED|127\.0\.0\.1:50021/i.test(text)) {
    return 'VOICEVOXを起動してからVoiceを再実行してください。';
  }
  return 'ログを確認して原因を修正し、コマンドを再実行してください。';
}

function message(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught);
}

function formatEta(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  return rounded >= 60 ? `${Math.floor(rounded / 60)}分${rounded % 60}秒` : `${rounded}秒`;
}

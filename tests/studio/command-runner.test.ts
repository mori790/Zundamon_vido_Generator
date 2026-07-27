import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import type {ChildProcessWithoutNullStreams, spawn} from 'node:child_process';
import {describe, expect, it, vi} from 'vitest';
import {CommandRunner, commandScripts} from '../../src/studio/main/command-runner';
import {serializeRenderProgress, type LogEntry, type Operation} from '../../src/studio/shared/command';

function fakeChild() {
  const child = new EventEmitter() as ChildProcessWithoutNullStreams;
  Object.assign(child, {
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    stdin: new PassThrough(),
    pid: 12345,
  });
  return child;
}

describe('CommandRunner', () => {
  it('preserves every existing CLI command mapping', () => {
    expect(commandScripts).toEqual({
      validate: 'validate',
      voice: 'voice',
      timeline: 'timeline',
      preview: 'preview',
      render: 'render',
    });
  });

  it('runs preflight before the requested command and streams logs', async () => {
    const children = [fakeChild(), fakeChild()];
    const spawnCommand = vi.fn(() => children.shift()!) as unknown as typeof spawn;
    const operations: Operation[] = [];
    const logs: LogEntry[] = [];
    const runner = new CommandRunner('/workspace', {
      operation: (operation) => operations.push(operation),
      log: (entry) => logs.push(entry),
    }, spawnCommand);

    runner.start({videoId: 'sample-video', command: 'voice'});
    const preflight = (spawnCommand as ReturnType<typeof vi.fn>).mock.results[0].value as ChildProcessWithoutNullStreams;
    (preflight.stdout as PassThrough).write('validated\n');
    preflight.emit('close', 0, null);
    await vi.waitFor(() => expect(spawnCommand).toHaveBeenCalledTimes(2));
    const command = (spawnCommand as ReturnType<typeof vi.fn>).mock.results[1].value as ChildProcessWithoutNullStreams;
    command.emit('close', 0, null);

    await vi.waitFor(() => expect(runner.snapshot().operation?.status).toBe('succeeded'));
    expect(operations.map((operation) => operation.status)).toContain('validating');
    expect(operations.map((operation) => operation.status)).toContain('running');
    expect(logs.some((entry) => entry.text === 'validated')).toBe(true);
  });

  it('rejects a second operation while one is running', () => {
    const child = fakeChild();
    const runner = new CommandRunner('/workspace', {operation: vi.fn(), log: vi.fn()}, vi.fn(() => child) as never);
    runner.start({videoId: 'sample-video', command: 'validate'});
    expect(() => runner.start({videoId: 'sample-video', command: 'voice'})).toThrow('別の操作を実行中です。');
  });

  it('marks a non-zero exit as failed', async () => {
    const child = fakeChild();
    const runner = new CommandRunner('/workspace', {operation: vi.fn(), log: vi.fn()}, vi.fn(() => child) as never);
    runner.start({videoId: 'sample-video', command: 'validate'});
    child.emit('close', 1, null);
    await vi.waitFor(() => expect(runner.snapshot().operation?.status).toBe('failed'));
    expect(runner.snapshot().operation?.failure).toBe('command-failed');
  });

  it('moves a stopped operation to cancelled', async () => {
    const child = fakeChild();
    const kill = vi.spyOn(process, 'kill').mockReturnValue(true);
    const runner = new CommandRunner('/workspace', {operation: vi.fn(), log: vi.fn()}, vi.fn(() => child) as never);
    const operation = runner.start({videoId: 'sample-video', command: 'validate'});
    expect(runner.stop(operation.id)).toBe(true);
    child.emit('close', null, 'SIGTERM');
    await vi.waitFor(() => expect(runner.snapshot().operation?.status).toBe('cancelled'));
    kill.mockRestore();
  });

  it('stores render progress and verifies output before success', async () => {
    const children = [fakeChild(), fakeChild()];
    const spawnCommand = vi.fn(() => children.shift()!) as unknown as typeof spawn;
    const verifyOutput = vi.fn().mockResolvedValue({});
    const runner = new CommandRunner(
      '/workspace',
      {operation: vi.fn(), log: vi.fn()},
      spawnCommand,
      verifyOutput,
    );
    runner.start({videoId: 'sample-video', command: 'render'});
    const preflight = (spawnCommand as ReturnType<typeof vi.fn>).mock.results[0].value as ChildProcessWithoutNullStreams;
    preflight.emit('close', 0, null);
    await vi.waitFor(() => expect(spawnCommand).toHaveBeenCalledTimes(2));
    const command = (spawnCommand as ReturnType<typeof vi.fn>).mock.results[1].value as ChildProcessWithoutNullStreams;
    (command.stdout as PassThrough).write(`${serializeRenderProgress({
      renderedFrames: 50,
      totalFrames: 100,
      fraction: 0.5,
      etaSeconds: 2,
    })}\n`);
    await vi.waitFor(() => expect(runner.snapshot().operation?.progress?.fraction).toBe(0.5));
    command.emit('close', 0, null);
    await vi.waitFor(() => expect(runner.snapshot().operation?.status).toBe('succeeded'));
    expect(verifyOutput).toHaveBeenCalledWith('sample-video');
  });

  it('fails render postflight without deleting partial output', async () => {
    const children = [fakeChild(), fakeChild()];
    const spawnCommand = vi.fn(() => children.shift()!) as unknown as typeof spawn;
    const logs: LogEntry[] = [];
    const runner = new CommandRunner(
      '/workspace',
      {operation: vi.fn(), log: (entry) => logs.push(entry)},
      spawnCommand,
      vi.fn().mockRejectedValue(new Error('empty output')),
    );
    runner.start({videoId: 'sample-video', command: 'render'});
    ((spawnCommand as ReturnType<typeof vi.fn>).mock.results[0].value as ChildProcessWithoutNullStreams)
      .emit('close', 0, null);
    await vi.waitFor(() => expect(spawnCommand).toHaveBeenCalledTimes(2));
    ((spawnCommand as ReturnType<typeof vi.fn>).mock.results[1].value as ChildProcessWithoutNullStreams)
      .emit('close', 0, null);
    await vi.waitFor(() => expect(runner.snapshot().operation?.status).toBe('failed'));
    expect(runner.snapshot().operation?.failure).toBe('output-verification-failed');
    expect(logs.some((entry) => entry.text.includes('自動削除されません'))).toBe(true);
  });
});

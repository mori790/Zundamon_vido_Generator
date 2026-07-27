import {describe, expect, it, vi} from 'vitest';
import {RealCodexConnection} from '../../src/studio/renderer/real-codex-connection';
import type {CodexApi, CodexEvent} from '../../src/studio/shared/codex-app-server';

function api() {
  let listener: (event: CodexEvent) => void = () => undefined;
  const value: CodexApi = {
    connect: vi.fn().mockResolvedValue({status: 'connected'}),
    send: vi.fn().mockResolvedValue(undefined),
    interrupt: vi.fn().mockResolvedValue(undefined),
    reconnect: vi.fn().mockResolvedValue({status: 'connected'}),
    startNewThread: vi.fn().mockResolvedValue(undefined),
    respondApproval: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    onEvent(next) {
      listener = next;
      return () => {
        listener = () => undefined;
      };
    },
  };
  return {value, emit: (event: CodexEvent) => listener(event)};
}

describe('RealCodexConnection', () => {
  it('streams events and completes exactly one pending turn', async () => {
    const testApi = api();
    const connection = new RealCodexConnection(testApi.value);
    const delta = vi.fn();
    connection.onDelta(delta);
    await connection.connectWorkspace('demo');
    const completed = connection.sendMessage({videoId: 'demo', message: 'hello'});
    testApi.emit({type: 'delta', text: 'Hi'});
    testApi.emit({
      type: 'turn-completed',
      message: {id: 'a1', role: 'assistant', content: 'Hi', createdAt: '2026-07-26T00:00:00Z'},
    });
    await expect(completed).resolves.toMatchObject({content: 'Hi'});
    expect(delta).toHaveBeenCalledWith('Hi');
  });

  it('forwards approval decisions and interruption', async () => {
    const testApi = api();
    const connection = new RealCodexConnection(testApi.value);
    const approval = vi.fn();
    connection.onApproval(approval);
    await connection.connectWorkspace('demo');
    testApi.emit({
      type: 'approval',
      approval: {id: '7', method: 'item/requestApproval', summary: 'write file', status: 'pending'},
    });
    await connection.respondApproval('7', false);
    await connection.interrupt();
    await connection.disconnect();
    expect(approval).toHaveBeenCalledOnce();
    expect(testApi.value.respondApproval).toHaveBeenCalledWith('7', false);
    expect(testApi.value.interrupt).toHaveBeenCalledTimes(2);
    expect(testApi.value.disconnect).toHaveBeenCalledOnce();
  });
});

import {describe, expect, it} from 'vitest';
import {
  encodeRpc,
  isApprovalMethod,
  hasRequestCapacity,
  parseRpcLine,
  settleApproval,
  transitionTurn,
  validatePrompt,
} from '../../src/studio/shared/codex-app-server';

describe('Codex App Server protocol', () => {
  it('round-trips requests and responses without a JSON-RPC header', () => {
    const request = {id: 1, method: 'thread/start', params: {cwd: '/workspace'}};
    expect(parseRpcLine(encodeRpc(request).trim())).toEqual(request);
    expect(parseRpcLine('{"id":1,"result":{"thread":{"id":"t1"}}}')).toEqual({
      id: 1,
      result: {thread: {id: 't1'}},
      error: undefined,
    });
  });

  it('bounds prompts and recognizes approval methods', () => {
    expect(validatePrompt(' hello ')).toBe('hello');
    expect(() => validatePrompt(' '.repeat(3))).toThrow();
    expect(isApprovalMethod('item/commandExecution/requestApproval')).toBe(true);
    expect(isApprovalMethod('turn/completed')).toBe(false);
    expect(hasRequestCapacity(127)).toBe(true);
    expect(hasRequestCapacity(128)).toBe(false);
    expect(() => parseRpcLine(`{"method":"x","params":"${'x'.repeat(1024 * 1024)}"}`)).toThrow(/1 MiB/);
  });

  it('keeps terminal turns and approvals monotonic', () => {
    expect(transitionTurn('idle', 'active')).toBe('active');
    expect(transitionTurn('completed', 'failed')).toBe('completed');
    expect(settleApproval('pending', true)).toBe('approved');
    expect(settleApproval('denied', true)).toBe('denied');
  });
});

import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {
  encodeRpc,
  parseRpcLine,
  settleApproval,
  transitionTurn,
  validatePrompt,
} from '../../src/studio/shared/codex-app-server';

describe('Codex App Server protocol properties', () => {
  it('round-trips bounded JSON request values', () => {
    fc.assert(fc.property(
      fc.integer({min: 0, max: 1_000_000}),
      fc.string({maxLength: 200}),
      fc.jsonValue(),
      (id, method, params) => {
        const value = {id, method, params};
        expect(parseRpcLine(encodeRpc(value).trim())).toEqual(JSON.parse(JSON.stringify(value)));
      },
    ));
  });

  it('trimmed nonblank bounded prompts are stable', () => {
    fc.assert(fc.property(
      fc.string({minLength: 1, maxLength: 200}).filter((value) => value.trim().length > 0),
      (value) => {
        expect(validatePrompt(value)).toBe(value.trim());
      },
    ));
  });

  it('rejects arbitrary non-object JSON values', () => {
    fc.assert(fc.property(
      fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)),
      (value) => {
        expect(() => parseRpcLine(JSON.stringify(value))).toThrow();
      },
    ));
  });

  it('never changes terminal turns or settled approvals', () => {
    fc.assert(fc.property(
      fc.constantFrom('completed' as const, 'failed' as const, 'interrupted' as const),
      fc.constantFrom('active' as const, 'completed' as const, 'failed' as const, 'interrupted' as const),
      (terminal, next) => {
        expect(transitionTurn(terminal, next)).toBe(terminal);
      },
    ));
    fc.assert(fc.property(fc.boolean(), (approved) => {
      expect(settleApproval('approved', approved)).toBe('approved');
      expect(settleApproval('denied', approved)).toBe('denied');
    }));
  });
});

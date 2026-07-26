import {describe, expect, it} from 'vitest';
import {createMinimalScript} from '../../src/studio/shared/script-draft';
import {
  extractProposals,
  isCommandOperation,
  MAX_PROPOSAL_MESSAGE_BYTES,
  transitionProposal,
} from '../../src/studio/shared/proposal';

const script = createMinimalScript('sample-video');
const now = '2026-07-25T00:00:00.000Z';

describe('proposal extraction', () => {
  it('prefers structured proposals over markdown JSON', () => {
    const result = extractProposals(
      'message-1',
      'sample-video',
      `\`\`\`json\n${JSON.stringify(script)}\n\`\`\``,
      [{kind: 'command', operation: 'validate'}],
      now,
    );

    expect(result.proposals).toEqual([
      expect.objectContaining({kind: 'command', operation: 'validate', status: 'pending'}),
    ]);
  });

  it('extracts a valid markdown VideoScript and ignores invalid JSON or schema', () => {
    const valid = extractProposals(
      'message-1',
      'sample-video',
      `\`\`\`json\n${JSON.stringify(script)}\n\`\`\``,
      [],
      now,
    );
    const invalid = extractProposals('message-2', 'sample-video', '```json\n{"title":"missing"}\n```', [], now);

    expect(valid.proposals[0]).toMatchObject({kind: 'json-draft', source: 'markdown-json-block'});
    expect(invalid.proposals).toEqual([]);
  });

  it('skips extraction above the 1 MB boundary', () => {
    const result = extractProposals(
      'message-1',
      'sample-video',
      'a'.repeat(MAX_PROPOSAL_MESSAGE_BYTES + 1),
      [{kind: 'command', operation: 'render'}],
      now,
    );

    expect(result).toEqual({proposals: [], oversized: true});
  });
});

describe('proposal state', () => {
  it('allows pending to approved to completed and blocks terminal transitions', () => {
    const proposal = extractProposals(
      'message-1',
      'sample-video',
      '',
      [{kind: 'command', operation: 'validate'}],
      now,
    ).proposals[0];
    const approved = transitionProposal(proposal, 'approved', {updatedAt: now});
    const completed = transitionProposal(approved, 'completed', {updatedAt: now});

    expect(approved.status).toBe('approved');
    expect(completed.status).toBe('completed');
    expect(transitionProposal(completed, 'approved')).toBe(completed);
  });

  it('accepts only allowlisted command operations', () => {
    expect(isCommandOperation('preview')).toBe(true);
    expect(isCommandOperation('rm -rf')).toBe(false);
  });
});

import {videoScriptSchema} from '../../schemas/video-script';
import type {VideoScript} from '../../types/video';

export const MAX_PROPOSAL_MESSAGE_BYTES = 1024 * 1024;
export const commandOperations = ['validate', 'voice', 'timeline', 'preview', 'render'] as const;

export type CommandOperation = (typeof commandOperations)[number];
export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';

type ProposalBase = {
  id: string;
  messageId: string;
  videoId: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export type JsonDraftProposal = ProposalBase & {
  kind: 'json-draft';
  source: 'structured-event' | 'markdown-json-block';
  script: VideoScript;
};

export type CommandProposal = ProposalBase & {
  kind: 'command';
  operation: CommandOperation;
};

export type Proposal = JsonDraftProposal | CommandProposal;

export type StructuredProposalInput =
  | {kind: 'json-draft'; script: unknown}
  | {kind: 'command'; operation: string};

export type ProposalExtractionResult = {
  proposals: Proposal[];
  oversized: boolean;
};

const proposalStatuses: ProposalStatus[] = ['pending', 'approved', 'rejected', 'completed', 'failed'];
const terminalStatuses = new Set<ProposalStatus>(['rejected', 'completed', 'failed']);

export function extractProposals(
  messageId: string,
  videoId: string,
  content: string,
  structured: StructuredProposalInput[] = [],
  now = new Date().toISOString(),
): ProposalExtractionResult {
  if (new TextEncoder().encode(content).byteLength > MAX_PROPOSAL_MESSAGE_BYTES) {
    return {proposals: [], oversized: true};
  }

  const inputs = structured.length > 0 ? structured : markdownJsonInputs(content);
  const proposals: Proposal[] = [];
  inputs.forEach((input, index) => {
    const base = {
      id: `${messageId}-proposal-${index + 1}`,
      messageId,
      videoId,
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    };

    if (input.kind === 'json-draft') {
      const result = videoScriptSchema.safeParse(input.script);
      if (result.success) {
        proposals.push({
          ...base,
          kind: 'json-draft',
          source: structured.length > 0 ? 'structured-event' : 'markdown-json-block',
          script: result.data,
        });
      }
      return;
    }

    if (isCommandOperation(input.operation)) {
      proposals.push({...base, kind: 'command', operation: input.operation});
    }
  });

  return {proposals, oversized: false};
}

export function transitionProposal(
  proposal: Proposal,
  status: ProposalStatus,
  options: {error?: string; updatedAt?: string} = {},
): Proposal {
  const allowed =
    proposal.status === 'pending'
      ? status === 'approved' || status === 'rejected'
      : proposal.status === 'approved'
        ? status === 'completed' || status === 'failed'
        : false;
  if (!allowed) {
    return proposal;
  }

  const next = {
    ...proposal,
    status,
    updatedAt: options.updatedAt ?? new Date().toISOString(),
  };
  if (options.error) {
    return {...next, error: options.error};
  }
  const {error: _error, ...withoutError} = next;
  return withoutError as Proposal;
}

export function isTerminalProposal(proposal: Proposal): boolean {
  return terminalStatuses.has(proposal.status);
}

export function isProposal(value: unknown): value is Proposal {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<Proposal>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.messageId !== 'string' ||
    typeof candidate.videoId !== 'string' ||
    !proposalStatuses.includes(candidate.status as ProposalStatus) ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.updatedAt !== 'string'
  ) {
    return false;
  }
  if (candidate.kind === 'json-draft') {
    return (
      (candidate.source === 'structured-event' || candidate.source === 'markdown-json-block') &&
      videoScriptSchema.safeParse(candidate.script).success
    );
  }
  return candidate.kind === 'command' && isCommandOperation(candidate.operation);
}

export function isCommandOperation(value: unknown): value is CommandOperation {
  return typeof value === 'string' && commandOperations.includes(value as CommandOperation);
}

function markdownJsonInputs(content: string): StructuredProposalInput[] {
  const inputs: StructuredProposalInput[] = [];
  const pattern = /```json\s*\n([\s\S]*?)```/gi;
  for (const match of content.matchAll(pattern)) {
    try {
      inputs.push({kind: 'json-draft', script: JSON.parse(match[1])});
    } catch {
      continue;
    }
  }
  return inputs;
}

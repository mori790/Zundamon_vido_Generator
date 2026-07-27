import {z} from 'zod';

export const releaseStates = ['local-acceptance', 'signed', 'notarized', 'verified', 'publishable'] as const;
export type ReleaseState = (typeof releaseStates)[number];

export type ReleaseEvidence = {
  signature: boolean;
  notarization: boolean;
  gatekeeper: boolean;
  ticket: boolean;
  checksum: boolean;
  manifest: boolean;
};

export const releaseManifestSchema = z.object({
  productName: z.literal('Zundamon Video Generator'),
  bundleId: z.literal('com.tomimorisatoshihare.zundamon-video-generator'),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/),
  gitRevision: z.string().regex(/^[0-9a-f]{7,40}$/),
  architecture: z.literal('arm64'),
  artifact: z.string().min(1),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  sbom: z.string().min(1),
  state: z.enum(releaseStates),
});

export type ReleaseManifest = z.infer<typeof releaseManifestSchema>;
export const acceptanceReleaseManifestSchema = releaseManifestSchema.extend({
  architecture: z.string().min(1),
});
export type AcceptanceReleaseManifest = z.infer<typeof acceptanceReleaseManifestSchema>;

export type AcceptanceReleaseIssue = {
  code: 'wrong-architecture' | 'wrong-release-state';
  messageJa: string;
  actionJa: string;
};

export type AcceptanceReleaseSummary = {
  ok: boolean;
  state: ReleaseState;
  architecture: string;
  publishable: false;
  messageJa: string;
  actionJa?: string;
  issues: AcceptanceReleaseIssue[];
};

export function normalizeReleaseManifest(value: ReleaseManifest): ReleaseManifest {
  return releaseManifestSchema.parse({...value, artifact: value.artifact.trim(), sbom: value.sbom.trim()});
}

export function normalizeAcceptanceReleaseManifest(value: AcceptanceReleaseManifest): AcceptanceReleaseManifest {
  return acceptanceReleaseManifestSchema.parse({...value, artifact: value.artifact.trim(), sbom: value.sbom.trim()});
}

export function classifyRelease(evidence: ReleaseEvidence): ReleaseState {
  if (!evidence.signature) return 'local-acceptance';
  if (!evidence.notarization) return 'signed';
  if (!evidence.gatekeeper || !evidence.ticket) return 'notarized';
  if (!evidence.checksum || !evidence.manifest) return 'verified';
  return 'publishable';
}

export function isAllowedArtifactPath(path: string): boolean {
  const normalized = path.replaceAll('\\', '/').replace(/^\.?\//, '');
  if (!normalized || normalized.startsWith('../') || normalized.includes('/../')) return false;
  return ![
    /(^|\/)(tests?|coverage|\.git|node_modules\/\.cache)(\/|$)/,
    /\.map$/,
    /(^|\/)\.env(?:\.|$)/,
    /(^|\/)(input|generated|output)(\/|$)/,
  ].some((pattern) => pattern.test(normalized));
}

export function summarizeAcceptanceRelease(manifest: AcceptanceReleaseManifest): AcceptanceReleaseSummary {
  const normalized = normalizeAcceptanceReleaseManifest(manifest);
  const issues: AcceptanceReleaseIssue[] = [];
  if (normalized.architecture !== 'arm64') {
    issues.push({
      code: 'wrong-architecture',
      messageJa: `artifact architectureがarm64ではありません: ${normalized.architecture}`,
      actionJa: 'arm64向けlocal-acceptance artifactを生成し直してください。',
    });
  }
  if (normalized.state !== 'local-acceptance') {
    issues.push({
      code: 'wrong-release-state',
      messageJa: `release stateがlocal-acceptanceではありません: ${normalized.state}`,
      actionJa: '内部受入用manifestを確認し、local-acceptance artifactとして再検証してください。',
    });
  }
  return {
    ok: issues.length === 0,
    state: normalized.state,
    architecture: normalized.architecture,
    publishable: false,
    messageJa:
      issues.length === 0
        ? '内部受入用local-acceptance artifactです。一般配布はできません。'
        : '内部受入preflightを通過できません。一般配布はできません。',
    actionJa: issues[0]?.actionJa,
    issues,
  };
}

export function sanitizeEvidencePathForReport(value: string, workspaceRoot?: string): string {
  const normalizedValue = value.trim().replaceAll('\\', '/');
  const normalizedRoot = workspaceRoot?.trim().replaceAll('\\', '/').replace(/\/+$/, '');
  const rootRelative =
    normalizedRoot && normalizedValue === normalizedRoot
      ? '.'
      : normalizedRoot && normalizedValue.startsWith(`${normalizedRoot}/`)
        ? normalizedValue.slice(normalizedRoot.length + 1)
        : normalizedValue;
  return rootRelative
    .replace(/^\/Users\/[^/]+/, '/Users/[user]')
    .replace(/((?:api[_-]?key|token|credential|password|secret)=)[^&\s]+/gi, '$1[redacted]');
}

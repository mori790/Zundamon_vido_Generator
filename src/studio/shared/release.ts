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

export function normalizeReleaseManifest(value: ReleaseManifest): ReleaseManifest {
  return releaseManifestSchema.parse({...value, artifact: value.artifact.trim(), sbom: value.sbom.trim()});
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

import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {
  classifyRelease,
  isAllowedArtifactPath,
  normalizeReleaseManifest,
  releaseManifestSchema,
  releaseStates,
} from '../../src/studio/shared/release';
import {normalizeWorkspaceReference, parseWorkspaceReference} from '../../src/studio/shared/workspace';

fc.configureGlobal({
  numRuns: Number(process.env.PBT_RUNS ?? 100),
  seed: process.env.PBT_SEED ? Number(process.env.PBT_SEED) : undefined,
});

describe('U10 release properties', () => {
  const hex = (minLength: number, maxLength = minLength) =>
    fc.array(fc.constantFrom(...'0123456789abcdef'), {minLength, maxLength}).map((value) => value.join(''));

  it('keeps workspace references normalized and round-trippable', () => {
    fc.assert(
      fc.property(fc.string({minLength: 1}).filter((root) => root.trim().length > 0), (root) => {
        const normalized = normalizeWorkspaceReference({schemaVersion: 1, root});
        expect(normalizeWorkspaceReference(normalized)).toEqual(normalized);
        expect(parseWorkspaceReference(JSON.parse(JSON.stringify(normalized)))).toEqual(normalized);
      }),
    );
  });

  it('never skips a release state', () => {
    fc.assert(
      fc.property(
        fc.record({
          signature: fc.boolean(),
          notarization: fc.boolean(),
          gatekeeper: fc.boolean(),
          ticket: fc.boolean(),
          checksum: fc.boolean(),
          manifest: fc.boolean(),
        }),
        (evidence) => {
          const state = classifyRelease(evidence);
          const index = releaseStates.indexOf(state);
          expect(index >= 1).toBe(evidence.signature);
          expect(index >= 2).toBe(evidence.signature && evidence.notarization);
          expect(index >= 3).toBe(
            evidence.signature && evidence.notarization && evidence.gatekeeper && evidence.ticket,
          );
          expect(index === 4).toBe(Object.values(evidence).every(Boolean));
        },
      ),
    );
  });

  it('normalizes valid manifests idempotently', () => {
    fc.assert(
      fc.property(
        fc.record({
          version: fc.tuple(fc.nat(), fc.nat(), fc.nat()).map((parts) => parts.join('.')),
          gitRevision: hex(7, 40),
          artifact: fc.string({minLength: 1}).filter((value) => value.trim().length > 0),
          sha256: hex(64),
          sbom: fc.string({minLength: 1}).filter((value) => value.trim().length > 0),
        }),
        (input) => {
          const manifest = releaseManifestSchema.parse({
            productName: 'Zundamon Video Generator',
            bundleId: 'com.tomimorisatoshihare.zundamon-video-generator',
            architecture: 'arm64',
            state: 'local-acceptance',
            ...input,
          });
          expect(normalizeReleaseManifest(normalizeReleaseManifest(manifest))).toEqual(
            normalizeReleaseManifest(manifest),
          );
        },
      ),
    );
  });

  it('rejects known development and workspace artifacts', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('tests/a.ts', 'coverage/a.json', '.env', 'a.js.map', 'input/a.json', '../secret'),
        (path) => {
          expect(isAllowedArtifactPath(path)).toBe(false);
        },
      ),
    );
    expect(isAllowedArtifactPath('dist-studio/main.cjs')).toBe(true);
  });
});

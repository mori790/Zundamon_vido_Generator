import {createHash} from 'node:crypto';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import fc from 'fast-check';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {runAcceptancePreflight} from '../../scripts/acceptance-preflight';
import {sanitizeEvidencePathForReport, summarizeAcceptanceRelease} from '../../src/studio/shared/release';

const roots: string[] = [];

async function tempRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'zvg-preflight-'));
  roots.push(root);
  await mkdir(path.join(root, 'out'), {recursive: true});
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, {recursive: true, force: true})));
});

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function writeReleaseFixture(
  root: string,
  overrides: Partial<{
    architecture: string;
    sha256: string;
    state: 'local-acceptance' | 'signed' | 'notarized' | 'verified' | 'publishable';
  }> = {},
): Promise<void> {
  const zipContent = 'fake zip';
  await writeFile(path.join(root, 'out', 'Zundamon-darwin-arm64.zip'), zipContent);
  await writeFile(path.join(root, 'out', 'release-sbom.cdx.json'), '{}\n');
  await writeFile(
    path.join(root, 'out', 'release-manifest.json'),
    `${JSON.stringify(
      {
        productName: 'Zundamon Video Generator',
        bundleId: 'com.tomimorisatoshihare.zundamon-video-generator',
        version: '0.1.0',
        gitRevision: 'abcdef0',
        architecture: 'arm64',
        artifact: 'out/Zundamon-darwin-arm64.zip',
        sha256: hash(zipContent),
        sbom: 'release-sbom.cdx.json',
        state: 'local-acceptance',
        ...overrides,
      },
      null,
      2,
    )}\n`,
  );
}

describe('acceptance preflight', () => {
  it('fails closed and skips heavy gates when release artifacts are missing', async () => {
    const root = await tempRoot();
    const runCommand = vi.fn();
    const lines: string[] = [];

    const result = await runAcceptancePreflight({root, write: (line) => lines.push(line), dependencies: {runCommand}});

    expect(result.status).toBe('failed');
    expect(result.exitCode).toBe(1);
    expect(result.checks).toContainEqual(expect.objectContaining({id: 'manifest', status: 'fail'}));
    expect(result.checks).toContainEqual(expect.objectContaining({id: 'studio-build', status: 'not-run'}));
    expect(runCommand).not.toHaveBeenCalled();
    expect(lines.join('\n')).toContain('local-acceptance artifactを生成');
  });

  it('rejects a checksum mismatch before running build and test gates', async () => {
    const root = await tempRoot();
    await writeReleaseFixture(root, {sha256: hash('different')});
    const runCommand = vi.fn();

    const result = await runAcceptancePreflight({root, dependencies: {runCommand}});

    expect(result.status).toBe('failed');
    expect(result.checks).toContainEqual(expect.objectContaining({id: 'checksum', status: 'fail'}));
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('rejects non-arm64 artifacts as an architecture gate failure', async () => {
    const root = await tempRoot();
    await writeReleaseFixture(root, {architecture: 'x64'});
    const runCommand = vi.fn();

    const result = await runAcceptancePreflight({root, dependencies: {runCommand}});

    expect(result.status).toBe('failed');
    expect(result.checks).toContainEqual(expect.objectContaining({id: 'wrong-architecture', status: 'fail'}));
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('rejects release states other than local-acceptance', async () => {
    const root = await tempRoot();
    await writeReleaseFixture(root, {state: 'publishable'});
    const runCommand = vi.fn();

    const result = await runAcceptancePreflight({root, dependencies: {runCommand}});

    expect(result.status).toBe('failed');
    expect(result.checks).toContainEqual(expect.objectContaining({id: 'wrong-release-state', status: 'fail'}));
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('fails when a required command gate fails', async () => {
    const root = await tempRoot();
    await writeReleaseFixture(root);
    const runCommand = vi
      .fn()
      .mockRejectedValueOnce(new Error('audit failed'))
      .mockResolvedValue(undefined);

    const result = await runAcceptancePreflight({root, dependencies: {runCommand}});

    expect(result.status).toBe('failed');
    expect(result.checks).toContainEqual(expect.objectContaining({id: 'production-audit', status: 'fail'}));
    expect(runCommand).toHaveBeenCalledWith('npm', ['audit', '--omit=dev']);
  });

  it('passes only after every artifact and command gate passes', async () => {
    const root = await tempRoot();
    await writeReleaseFixture(root);
    const runCommand = vi.fn().mockResolvedValue(undefined);

    const result = await runAcceptancePreflight({root, dependencies: {runCommand}});

    expect(result.status).toBe('passed');
    expect(result.exitCode).toBe(0);
    expect(runCommand).toHaveBeenCalledTimes(4);
  });
});

describe('acceptance preflight properties', () => {
  it('never reports acceptance release summaries as publishable', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('local-acceptance', 'signed', 'notarized', 'verified', 'publishable'),
        fc.string({minLength: 1}),
        (state, architecture) => {
          const summary = summarizeAcceptanceRelease({
            productName: 'Zundamon Video Generator',
            bundleId: 'com.tomimorisatoshihare.zundamon-video-generator',
            version: '0.1.0',
            gitRevision: 'abcdef0',
            architecture,
            artifact: 'out/app.zip',
            sha256: 'a'.repeat(64),
            sbom: 'release-sbom.cdx.json',
            state,
          });
          expect(summary.publishable).toBe(false);
          expect(summary.messageJa).not.toContain('一般配布可能');
        },
      ),
    );
  });

  it('sanitizes absolute user paths and credential-like query values', () => {
    const tokenValue = fc
      .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), {minLength: 1, maxLength: 32})
      .map((value) => value.join(''));
    fc.assert(
      fc.property(
        fc
          .string({minLength: 1})
          .filter(
            (userName) => userName.trim().length > 0 && !userName.includes('/') && !userName.includes('\\'),
          ),
        tokenValue,
        (userName, secret) => {
        const pathValue = `/Users/${userName}/Desktop/report.txt?token=${secret}`;
        const sanitized = sanitizeEvidencePathForReport(pathValue);
        expect(sanitized).toContain('/Users/[user]/');
        expect(sanitized).toContain('token=[redacted]');
        expect(sanitized).not.toContain(`token=${secret}`);
        },
      ),
    );
  });
});

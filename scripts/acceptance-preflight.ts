import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {access, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {
  acceptanceReleaseManifestSchema,
  sanitizeEvidencePathForReport,
  summarizeAcceptanceRelease,
  type AcceptanceReleaseManifest,
} from '../src/studio/shared/release';

const exec = promisify(execFile);

export type PreflightStatus = 'pass' | 'fail' | 'not-run';

export type PreflightCheck = {
  id: string;
  labelJa: string;
  status: PreflightStatus;
  evidencePath?: string;
  actionJa?: string;
  messageJa?: string;
};

export type PreflightResult = {
  status: 'passed' | 'failed';
  checks: PreflightCheck[];
  exitCode: number;
};

export type CommandRunner = (command: string, args: string[]) => Promise<void>;

export type PreflightDependencies = {
  readFile: typeof readFile;
  stat: typeof stat;
  access: typeof access;
  runCommand: CommandRunner;
};

export type PreflightOptions = {
  root?: string;
  outDir?: string;
  write?: (line: string) => void;
  dependencies?: Partial<PreflightDependencies>;
};

const defaultDependencies: PreflightDependencies = {
  readFile,
  stat,
  access,
  runCommand: async (command, args) => {
    await exec(command, args, {timeout: 10 * 60_000, maxBuffer: 8 * 1024 * 1024});
  },
};

function mergeDependencies(overrides?: Partial<PreflightDependencies>): PreflightDependencies {
  return {...defaultDependencies, ...overrides};
}

function check(
  id: string,
  labelJa: string,
  status: PreflightStatus,
  evidencePath?: string,
  actionJa?: string,
  messageJa?: string,
): PreflightCheck {
  return {id, labelJa, status, evidencePath, actionJa, messageJa};
}

async function exists(dependencies: PreflightDependencies, target: string): Promise<boolean> {
  try {
    await dependencies.access(target);
    return true;
  } catch {
    return false;
  }
}

async function sha256(dependencies: PreflightDependencies, target: string): Promise<string> {
  return createHash('sha256').update(await dependencies.readFile(target)).digest('hex');
}

function resolveManifestArtifact(root: string, manifest: AcceptanceReleaseManifest): {artifactPath: string; sbomPath: string} {
  const artifactPath = path.isAbsolute(manifest.artifact)
    ? manifest.artifact
    : path.resolve(root, manifest.artifact);
  const sbomPath = path.isAbsolute(manifest.sbom)
    ? manifest.sbom
    : path.resolve(root, 'out', manifest.sbom);
  return {artifactPath, sbomPath};
}

async function verifyArtifacts(
  root: string,
  outDir: string,
  dependencies: PreflightDependencies,
): Promise<{passed: boolean; checks: PreflightCheck[]; manifest?: AcceptanceReleaseManifest}> {
  const manifestPath = path.join(outDir, 'release-manifest.json');
  const checks: PreflightCheck[] = [];
  if (!(await exists(dependencies, manifestPath))) {
    checks.push(
      check(
        'manifest',
        'release manifest',
        'fail',
        sanitizeEvidencePathForReport(manifestPath, root),
        '`npm run release:local`でlocal-acceptance artifactを生成してから再実行してください。',
        'release-manifest.jsonが見つかりません。',
      ),
    );
    return {passed: false, checks};
  }
  checks.push(check('manifest', 'release manifest', 'pass', sanitizeEvidencePathForReport(manifestPath, root)));

  let manifest: AcceptanceReleaseManifest;
  try {
    manifest = acceptanceReleaseManifestSchema.parse(JSON.parse(await dependencies.readFile(manifestPath, 'utf8')));
  } catch (error) {
    checks.push(
      check(
        'manifest-parse',
        'manifest parse',
        'fail',
        sanitizeEvidencePathForReport(manifestPath, root),
        'release manifestを再生成してください。',
        error instanceof Error ? error.message : String(error),
      ),
    );
    return {passed: false, checks};
  }

  const {artifactPath, sbomPath} = resolveManifestArtifact(root, manifest);
  if (!(await exists(dependencies, artifactPath)) || !artifactPath.endsWith('.zip')) {
    checks.push(
      check(
        'artifact',
        'arm64 ZIP',
        'fail',
        sanitizeEvidencePathForReport(artifactPath, root),
        '`npm run release:local`でarm64 ZIPを生成してください。',
        '内部受入用ZIPが見つからないか、ZIPではありません。',
      ),
    );
    return {passed: false, checks, manifest};
  }
  checks.push(check('artifact', 'arm64 ZIP', 'pass', sanitizeEvidencePathForReport(artifactPath, root)));

  if (!(await exists(dependencies, sbomPath))) {
    checks.push(
      check(
        'sbom',
        'SBOM',
        'fail',
        sanitizeEvidencePathForReport(sbomPath, root),
        '`npm run release:local`でSBOMを生成してください。',
        'SBOMが見つかりません。',
      ),
    );
    return {passed: false, checks, manifest};
  }
  checks.push(check('sbom', 'SBOM', 'pass', sanitizeEvidencePathForReport(sbomPath, root)));

  const actualHash = await sha256(dependencies, artifactPath);
  if (actualHash !== manifest.sha256) {
    checks.push(
      check(
        'checksum',
        'ZIP SHA-256',
        'fail',
        sanitizeEvidencePathForReport(artifactPath, root),
        'ZIPを配布せず、release artifactを再生成してください。',
        'ZIPのSHA-256がmanifestと一致しません。',
      ),
    );
    return {passed: false, checks, manifest};
  }
  checks.push(check('checksum', 'ZIP SHA-256', 'pass', sanitizeEvidencePathForReport(artifactPath, root)));

  const summary = summarizeAcceptanceRelease(manifest);
  for (const issue of summary.issues) {
    checks.push(check(issue.code, issue.messageJa, 'fail', undefined, issue.actionJa, issue.messageJa));
  }
  if (!summary.ok) return {passed: false, checks, manifest};
  checks.push(check('release-state', 'release state', 'pass', undefined, undefined, summary.messageJa));
  return {passed: true, checks, manifest};
}

async function runGate(
  dependencies: PreflightDependencies,
  write: (line: string) => void,
  id: string,
  labelJa: string,
  command: string,
  args: string[],
): Promise<PreflightCheck> {
  write(`開始: ${labelJa}`);
  try {
    await dependencies.runCommand(command, args);
    write(`成功: ${labelJa}`);
    return check(id, labelJa, 'pass');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    write(`失敗: ${labelJa}`);
    return check(id, labelJa, 'fail', undefined, `${labelJa}の失敗を修正してから再実行してください。`, message);
  }
}

export function formatPreflightReport(result: PreflightResult): string {
  const lines = [
    '# 内部受入preflight結果',
    '',
    result.status === 'passed'
      ? '結果: 成功。内部受入用local-acceptance artifactとして確認できます。一般配布はできません。'
      : '結果: 失敗。表示されたactionを実施してから再実行してください。一般配布はできません。',
    '',
  ];
  for (const item of result.checks) {
    const status = item.status === 'pass' ? 'PASS' : item.status === 'fail' ? 'FAIL' : 'NOT RUN';
    lines.push(`- ${status}: ${item.labelJa}`);
    if (item.evidencePath) lines.push(`  - 証跡: ${item.evidencePath}`);
    if (item.messageJa) lines.push(`  - 内容: ${item.messageJa}`);
    if (item.actionJa) lines.push(`  - action: ${item.actionJa}`);
  }
  return `${lines.join('\n')}\n`;
}

export async function runAcceptancePreflight(options: PreflightOptions = {}): Promise<PreflightResult> {
  const root = options.root ?? process.cwd();
  const outDir = options.outDir ?? path.join(root, 'out');
  const write = options.write ?? (() => undefined);
  const dependencies = mergeDependencies(options.dependencies);

  write('開始: 軽量artifact gate');
  const artifactGate = await verifyArtifacts(root, outDir, dependencies);
  if (!artifactGate.passed) {
    const skipped = [
      check('production-audit', 'production dependency audit', 'not-run'),
      check('typecheck', 'TypeScript typecheck', 'not-run'),
      check('default-tests', 'default tests', 'not-run'),
      check('studio-build', 'Studio build', 'not-run'),
    ];
    const result: PreflightResult = {status: 'failed', checks: [...artifactGate.checks, ...skipped], exitCode: 1};
    write(formatPreflightReport(result).trimEnd());
    return result;
  }
  write('成功: 軽量artifact gate');

  const commandChecks = [
    await runGate(dependencies, write, 'production-audit', 'production dependency audit', 'npm', [
      'audit',
      '--omit=dev',
    ]),
    await runGate(dependencies, write, 'typecheck', 'TypeScript typecheck', 'npx', ['tsc', '--noEmit']),
    await runGate(dependencies, write, 'default-tests', 'default tests', 'npm', ['test']),
    await runGate(dependencies, write, 'studio-build', 'Studio build', 'npm', ['run', 'studio:build']),
  ];
  const checks = [...artifactGate.checks, ...commandChecks];
  const result: PreflightResult = {
    status: checks.every((item) => item.status === 'pass') ? 'passed' : 'failed',
    checks,
    exitCode: checks.every((item) => item.status === 'pass') ? 0 : 1,
  };
  write(formatPreflightReport(result).trimEnd());
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runAcceptancePreflight({write: (line) => console.log(line)})
    .then((result) => {
      process.exitCode = result.exitCode;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}

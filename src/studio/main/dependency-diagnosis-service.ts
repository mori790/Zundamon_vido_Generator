import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import type {
  DependencyApi,
  DependencyName,
  DependencyReport,
  DependencyStatus,
} from '../shared/desktop';

const run = promisify(execFile);

export function createDependencyDiagnosisService(
  execute = run,
  request = fetch,
): DependencyApi {
  async function checkCodex(): Promise<DependencyStatus> {
    try {
      const versionResult = await execute('codex', ['--version'], {timeout: 5_000});
      const detectedVersion = versionResult.stdout.trim().match(/\d+\.\d+\.\d+/)?.[0];
      if (!detectedVersion || compareVersions(detectedVersion, '0.145.0') < 0) {
        return {dependency: 'codex', status: 'unsupported', detectedVersion, actionCode: 'codex-upgrade'};
      }
      try {
        await execute('codex', ['login', 'status'], {timeout: 5_000});
      } catch {
        return {dependency: 'codex', status: 'unauthenticated', detectedVersion, actionCode: 'codex-login'};
      }
      return {dependency: 'codex', status: 'ready', detectedVersion};
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      return {
        dependency: 'codex',
        status: code === 'ENOENT' ? 'missing' : 'unreachable',
        actionCode: code === 'ENOENT' ? 'codex-install' : 'codex-retry',
      };
    }
  }

  async function checkVoicevox(): Promise<DependencyStatus> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3_000);
    try {
      const response = await request('http://127.0.0.1:50021/version', {signal: controller.signal});
      if (!response.ok) throw new Error(`VOICEVOX HTTP ${response.status}`);
      const detectedVersion = String(await response.json());
      return {dependency: 'voicevox', status: 'ready', detectedVersion};
    } catch {
      return {dependency: 'voicevox', status: 'stopped', actionCode: 'voicevox-start'};
    } finally {
      clearTimeout(timer);
    }
  }

  async function check(name: DependencyName): Promise<DependencyStatus> {
    return name === 'codex' ? checkCodex() : checkVoicevox();
  }

  async function checkAll(): Promise<DependencyReport> {
    const [codex, voicevox] = await Promise.all([checkCodex(), checkVoicevox()]);
    return {codex, voicevox};
  }

  return {check, checkAll};
}

function compareVersions(left: string, right: string): number {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {readdir, readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {promisify} from 'node:util';
import {isAllowedArtifactPath, type ReleaseEvidence, classifyRelease} from '../src/studio/shared/release';

const run = promisify(execFile);
const root = process.cwd();
const mode = process.argv[2] ?? 'local';
const out = path.join(root, 'out');

async function files(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(target));
    else result.push(target);
  }
  return result;
}

async function findArtifacts(): Promise<{app: string; zip?: string}> {
  const candidates = await files(out);
  const appFile = candidates.find((file) => file.endsWith('.app/Contents/Info.plist'));
  if (!appFile) throw new Error('Package済み.appが見つかりません。');
  return {
    app: appFile.slice(0, -'/Contents/Info.plist'.length),
    zip: candidates.find((file) => file.endsWith('.zip')),
  };
}

async function sha256(file: string): Promise<string> {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

async function verifyInclusion(app: string): Promise<void> {
  const appFiles = await files(app);
  const invalid = appFiles.map((file) => path.relative(app, file)).filter((file) => !isAllowedArtifactPath(file));
  if (invalid.length) throw new Error(`配布対象外fileを検出しました: ${invalid.slice(0, 10).join(', ')}`);
}

async function apple(command: string, args: string[]): Promise<void> {
  await run(command, args, {timeout: 120_000, maxBuffer: 1024 * 1024});
}

async function main(): Promise<void> {
  const artifact = await findArtifacts();
  await verifyInclusion(artifact.app);
  const target = artifact.zip ?? path.join(artifact.app, 'Contents', 'Info.plist');
  const size = (await stat(target)).size;
  if (size > 300 * 1024 * 1024) throw new Error('Artifactが300 MiBを超えています。');
  if (size > 200 * 1024 * 1024) console.warn('警告: Artifactが200 MiBを超えています。');

  const evidence: ReleaseEvidence = {
    signature: false,
    notarization: false,
    gatekeeper: false,
    ticket: false,
    checksum: true,
    manifest: true,
  };
  if (mode === 'public') {
    await apple('codesign', ['--verify', '--deep', '--strict', artifact.app]);
    evidence.signature = true;
    await apple('xcrun', ['stapler', 'validate', artifact.app]);
    evidence.notarization = true;
    evidence.ticket = true;
    await apple('spctl', ['--assess', '--type', 'execute', '--verbose=2', artifact.app]);
    evidence.gatekeeper = true;
  }
  const state = classifyRelease(evidence);
  if (mode === 'public' && state !== 'publishable') throw new Error('一般配布gateを通過できません。');

  const {stdout: gitRevision} = await run('git', ['rev-parse', 'HEAD']);
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as {version: string};
  const manifest = {
    productName: 'Zundamon Video Generator',
    bundleId: 'com.tomimorisatoshihare.zundamon-video-generator',
    version: pkg.version,
    gitRevision: gitRevision.trim(),
    architecture: 'arm64',
    artifact: path.relative(root, target),
    sha256: await sha256(target),
    sbom: 'release-sbom.cdx.json',
    state,
  };
  await writeFile(path.join(out, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Release state: ${state}`);
  if (state !== 'publishable') console.log('一般配布は禁止されています。');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

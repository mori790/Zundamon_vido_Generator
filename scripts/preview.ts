import {spawn} from 'node:child_process';
import {checkAssets} from '../src/core/asset-checker';
import {formatError} from '../src/core/errors';
import {Logger} from '../src/core/logger';
import {buildRenderData} from '../src/core/render-data-builder';
import {collectScriptWarnings, loadVideoScript} from '../src/core/script-loader';

export async function runPreviewCommand(argv: string[] = process.argv.slice(2)): Promise<void> {
  const {videoId, verbose} = parseArgs(argv);
  const logger = new Logger(verbose);
  const script = await loadVideoScript(videoId);
  const warnings = collectScriptWarnings(script);
  const assets = await checkAssets(script);
  for (const warning of [...warnings, ...assets.warnings]) {
    logger.warn(warning.message);
  }
  if (assets.errors.length > 0) {
    for (const error of assets.errors) {
      logger.error(error.message);
    }
    process.exitCode = 1;
    return;
  }

  logger.info(`Remotion Studioを起動します: ${videoId}`);
  const props = await buildRenderData(videoId);
  const child = spawn('npx', ['remotion', 'studio', 'src/Root.tsx', '--props', JSON.stringify(props)], {
    stdio: 'inherit',
    shell: false,
  });
  child.on('exit', (code) => {
    process.exitCode = code ?? 0;
  });
}

function parseArgs(argv: string[]): {videoId: string; verbose: boolean} {
  const videoId = argv.find((arg) => !arg.startsWith('--')) ?? '';
  if (!videoId) {
    throw new Error('動画IDを指定してください。例: npm run preview -- sample-video');
  }
  return {videoId, verbose: argv.includes('--verbose')};
}

runPreviewCommand().catch((error) => {
  const logger = new Logger(process.argv.includes('--verbose'));
  logger.error(formatError(error));
  process.exitCode = 1;
});

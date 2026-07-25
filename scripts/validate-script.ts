import {checkAssets} from '../src/core/asset-checker';
import {formatError} from '../src/core/errors';
import {Logger} from '../src/core/logger';
import {collectScriptWarnings, loadVideoScript} from '../src/core/script-loader';

export async function runValidateCommand(argv: string[] = process.argv.slice(2)): Promise<void> {
  const {videoId, verbose} = parseArgs(argv);
  const logger = new Logger(verbose);
  const script = await loadVideoScript(videoId);
  logger.info(`台本を読み込みました: ${script.id}`);
  logger.info(`${script.scenes.length}個のシーンを検出しました`);

  const scriptWarnings = collectScriptWarnings(script);
  const assetResult = await checkAssets(script);
  for (const warning of [...scriptWarnings, ...assetResult.warnings]) {
    logger.warn(formatIssue(warning));
  }

  if (assetResult.errors.length > 0) {
    for (const error of assetResult.errors) {
      logger.error(formatIssue(error));
    }
    process.exitCode = 1;
    return;
  }

  logger.info('入力チェックが完了しました');
}

function parseArgs(argv: string[]): {videoId: string; verbose: boolean} {
  const videoId = argv.find((arg) => !arg.startsWith('--')) ?? '';
  if (!videoId) {
    throw new Error('動画IDを指定してください。例: npm run validate -- sample-video');
  }
  return {videoId, verbose: argv.includes('--verbose')};
}

function formatIssue(issue: {message: string; sceneId?: string; targetPath?: string}): string {
  return [issue.message, issue.sceneId ? `シーン: ${issue.sceneId}` : undefined, issue.targetPath ? `対象: ${issue.targetPath}` : undefined]
    .filter(Boolean)
    .join('\n');
}

runValidateCommand().catch((error) => {
  const logger = new Logger(process.argv.includes('--verbose'));
  logger.error(formatError(error));
  process.exitCode = 1;
});

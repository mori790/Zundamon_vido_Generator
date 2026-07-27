import {checkAssets} from '../src/core/asset-checker';
import {formatError, formatVerboseCause} from '../src/core/errors';
import {Logger} from '../src/core/logger';
import {loadManifest} from '../src/core/manifest-store';
import {renderVideo} from '../src/core/render-service';
import {collectScriptWarnings, loadVideoScript} from '../src/core/script-loader';
import {generateTimeline} from '../src/core/timeline-generator';
import {saveTimeline} from '../src/core/timeline-store';
import {generateVoices} from '../src/core/voice-generator';
import {serializeRenderProgress} from '../src/studio/shared/command';

export async function runVideoCommand(argv: string[] = process.argv.slice(2)): Promise<void> {
  const {videoId, force, verbose, skipVoice} = parseArgs(argv);
  const logger = new Logger(verbose);

  const script = await loadVideoScript(videoId);
  logger.info(`台本を読み込みました: ${script.id}`);
  logger.info(`${script.scenes.length}個のシーンを検出しました`);

  const warnings = collectScriptWarnings(script);
  const assets = await checkAssets(script);
  for (const warning of [...warnings, ...assets.warnings]) {
    logger.warn([warning.message, warning.sceneId ? `シーン: ${warning.sceneId}` : undefined, warning.targetPath ? `対象: ${warning.targetPath}` : undefined].filter(Boolean).join('\n'));
  }
  if (assets.errors.length > 0) {
    for (const error of assets.errors) {
      logger.error([error.message, error.sceneId ? `シーン: ${error.sceneId}` : undefined, error.targetPath ? `対象: ${error.targetPath}` : undefined].filter(Boolean).join('\n'));
    }
    process.exitCode = 1;
    return;
  }

  if (!skipVoice) {
    await generateVoices(videoId, {force, verbose});
  }

  const manifest = await loadManifest(videoId);
  const timeline = generateTimeline(script, manifest);
  await saveTimeline(videoId, timeline);
  logger.info('タイムラインを生成しました');
  await renderVideo(videoId, {
    verbose,
    onProgress(progress) {
      console.log(serializeRenderProgress(progress));
    },
  });
}

function parseArgs(argv: string[]): {videoId: string; force: boolean; verbose: boolean; skipVoice: boolean} {
  const videoId = argv.find((arg) => !arg.startsWith('--')) ?? '';
  if (!videoId) {
    throw new Error('動画IDを指定してください。例: npm run video -- sample-video');
  }
  return {
    videoId,
    force: argv.includes('--force'),
    verbose: argv.includes('--verbose'),
    skipVoice: argv.includes('--skip-voice'),
  };
}

runVideoCommand().catch((error) => {
  const logger = new Logger(process.argv.includes('--verbose'));
  logger.error(formatError(error));
  const cause = formatVerboseCause(error);
  if (process.argv.includes('--verbose') && cause) {
    logger.error(cause);
  }
  process.exitCode = 1;
});

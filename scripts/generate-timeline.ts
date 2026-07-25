import {formatError} from '../src/core/errors';
import {Logger} from '../src/core/logger';
import {loadManifest} from '../src/core/manifest-store';
import {loadVideoScript} from '../src/core/script-loader';
import {generateTimeline} from '../src/core/timeline-generator';
import {saveTimeline} from '../src/core/timeline-store';

export async function runTimelineCommand(argv: string[] = process.argv.slice(2)): Promise<void> {
  const {videoId, verbose} = parseArgs(argv);
  const logger = new Logger(verbose);
  const script = await loadVideoScript(videoId);
  const manifest = await loadManifest(videoId);
  const timeline = generateTimeline(script, manifest);
  await saveTimeline(videoId, timeline);
  logger.info(`タイムラインを生成しました: generated/timelines/${videoId}.timeline.json`);
}

function parseArgs(argv: string[]): {videoId: string; verbose: boolean} {
  const videoId = argv.find((arg) => !arg.startsWith('--')) ?? '';
  if (!videoId) {
    throw new Error('動画IDを指定してください。例: npm run timeline -- sample-video');
  }
  return {videoId, verbose: argv.includes('--verbose')};
}

runTimelineCommand().catch((error) => {
  const logger = new Logger(process.argv.includes('--verbose'));
  logger.error(formatError(error));
  process.exitCode = 1;
});

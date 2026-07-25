import {formatError} from '../src/core/errors';
import {generateVoices} from '../src/core/voice-generator';
import {Logger} from '../src/core/logger';

export async function runVoiceCommand(argv: string[] = process.argv.slice(2)): Promise<void> {
  const {videoId, force, verbose} = parseArgs(argv);
  const result = await generateVoices(videoId, {force, verbose});
  const logger = new Logger(verbose);
  logger.info(`音声生成が完了しました: generated=${result.generated.length}, cached=${result.cached.length}`);
}

function parseArgs(argv: string[]): {videoId: string; force: boolean; verbose: boolean} {
  const videoId = argv.find((arg) => !arg.startsWith('--')) ?? '';
  if (!videoId) {
    throw new Error('動画IDを指定してください。例: npm run voice -- sample-video');
  }
  return {
    videoId,
    force: argv.includes('--force'),
    verbose: argv.includes('--verbose'),
  };
}

runVoiceCommand().catch((error) => {
  const logger = new Logger(process.argv.includes('--verbose'));
  logger.error(formatError(error));
  process.exitCode = 1;
});

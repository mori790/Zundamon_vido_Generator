import {
  createChatMessage,
  type ChatMessage,
  type CodexConnection,
  type CodexConnectionState,
  type CodexUserInput,
} from '../shared/chat';

const DEFAULT_DELAY_MS = 300;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockCodexConnection implements CodexConnection {
  constructor(private readonly delayMs = DEFAULT_DELAY_MS) {}

  async connect(): Promise<CodexConnectionState> {
    return {status: 'mock-ready'};
  }

  async sendMessage(input: CodexUserInput): Promise<ChatMessage> {
    await wait(this.delayMs);
    const title = input.context?.title ? `「${input.context.title}」` : input.videoId;
    return createChatMessage(
      'assistant',
      `Mock: ${title} の企画相談を受け取りました。対象者、尺、結論、シーン構成を一緒に整理できます。`,
    );
  }

  async disconnect(): Promise<void> {
    return;
  }
}


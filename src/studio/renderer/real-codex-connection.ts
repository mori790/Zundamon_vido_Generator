import type {ChatMessage, CodexConnection, CodexConnectionState, CodexUserInput} from '../shared/chat';
import type {CodexApi, CodexApproval, CodexEvent} from '../shared/codex-app-server';

declare global {
  var codexApi: CodexApi | undefined;
}

export class RealCodexConnection implements CodexConnection {
  private videoId = '';
  private unsubscribe: (() => void) | null = null;
  private completion: {resolve(message: ChatMessage): void; reject(error: Error): void} | null = null;
  private approvalListener: ((approval: CodexApproval) => void) | null = null;
  private deltaListener: ((text: string) => void) | null = null;

  constructor(private readonly api = globalThis.codexApi) {}

  onApproval(listener: (approval: CodexApproval) => void): () => void {
    this.approvalListener = listener;
    return () => {
      if (this.approvalListener === listener) this.approvalListener = null;
    };
  }

  onDelta(listener: (text: string) => void): () => void {
    this.deltaListener = listener;
    return () => {
      if (this.deltaListener === listener) this.deltaListener = null;
    };
  }

  async respondApproval(id: string, approved: boolean): Promise<void> {
    await this.requiredApi().respondApproval(id, approved);
  }

  async connect(): Promise<CodexConnectionState> {
    throw new Error('videoId is required. Use connectWorkspace().');
  }

  async connectWorkspace(videoId: string): Promise<CodexConnectionState> {
    this.videoId = videoId;
    this.unsubscribe?.();
    this.unsubscribe = this.requiredApi().onEvent((event) => this.handle(event));
    return this.requiredApi().connect(videoId);
  }

  async sendMessage(input: CodexUserInput): Promise<ChatMessage> {
    if (this.completion) throw new Error('Codex turn is already active.');
    return new Promise<ChatMessage>((resolve, reject) => {
      this.completion = {resolve, reject};
      this.requiredApi().send(input).catch((error) => {
        this.completion = null;
        reject(error instanceof Error ? error : new Error(String(error)));
      });
    });
  }

  async interrupt(): Promise<void> {
    await this.requiredApi().interrupt();
  }

  reconnect(): Promise<CodexConnectionState> {
    return this.requiredApi().reconnect(this.videoId);
  }

  async startNewThread(): Promise<void> {
    await this.requiredApi().startNewThread(this.videoId);
  }

  async disconnect(): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.completion?.reject(new Error('Codex connection closed.'));
    this.completion = null;
    await this.api?.interrupt().catch(() => undefined);
    await this.api?.disconnect();
  }

  private handle(event: CodexEvent): void {
    if (event.type === 'approval') this.approvalListener?.(event.approval);
    if (event.type === 'delta') this.deltaListener?.(event.text);
    if (event.type === 'turn-completed') {
      this.completion?.resolve(event.message);
      this.completion = null;
    }
    if (event.type === 'turn-failed') {
      this.completion?.reject(new Error(event.message));
      this.completion = null;
    }
  }

  private requiredApi(): CodexApi {
    if (!this.api) throw new Error('Codex App Server API is unavailable.');
    return this.api;
  }
}

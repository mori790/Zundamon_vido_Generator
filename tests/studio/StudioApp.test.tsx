import '@testing-library/jest-dom/vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {StudioApp} from '../../src/studio/renderer/StudioApp';
import type {AssetFileAccess} from '../../src/studio/renderer/asset-file-access';
import {createEmptyDraftWorkspace, createExistingWorkspace} from '../../src/studio/shared/workspace';
import {createChatMessage} from '../../src/studio/shared/chat';
import {extractProposals} from '../../src/studio/shared/proposal';
import type {CommandApi, Operation} from '../../src/studio/shared/command';
import type {VideoScript} from '../../src/types/video';
import * as chatHistoryStore from '../../src/studio/renderer/chat-history-store';
import * as workspaceClient from '../../src/studio/renderer/workspace-client';

const script: VideoScript = {
  id: 'sample-video',
  title: 'Sample',
  speaker: {
    engine: 'voicevox',
    speakerId: 3,
    speedScale: 1,
    pitchScale: 0,
    intonationScale: 1,
    volumeScale: 1,
  },
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    bgmVolume: 0.1,
  },
  subtitle: {
    enabled: true,
    maxCharactersPerLine: 24,
    maxLines: 2,
    fontSize: 56,
    bottom: 50,
    highlightKeywords: [],
  },
  scenes: [
    {
      id: 'scene-001',
      type: 'explanation',
      text: 'テストなのだ。',
      emotion: 'normal',
      durationBeforeSpeech: 0.2,
      durationAfterSpeech: 0.3,
      characterVisible: true,
    },
  ],
};

describe('StudioApp', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete globalThis.commandApi;
    delete globalThis.previewApi;
    delete globalThis.renderOutputApi;
  });

  it('renders project list from input scripts', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);

    render(<StudioApp />);

    expect(await screen.findByText('sample-video')).toBeInTheDocument();
    expect(screen.getByTestId('start-screen-project-list')).toBeInTheDocument();
  });

  it('opens an existing workspace from the project list', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createExistingWorkspace('sample-video', script),
    });

    render(<StudioApp />);

    fireEvent.click(await screen.findByTestId('project-list-item-sample-video'));

    expect(await screen.findByTestId('workspace-header-video-id')).toHaveTextContent('sample-video');
    expect(screen.getByTestId('workspace-header-mode')).toHaveTextContent('既存台本');
    expect(screen.getByTestId('script-review-panel')).toBeInTheDocument();
    expect(screen.getByTestId('codex-panel')).toBeInTheDocument();
  });

  it('opens a new video ID as empty draft workspace', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createEmptyDraftWorkspace('new-video'),
    });

    render(<StudioApp />);

    fireEvent.change(screen.getByTestId('start-screen-new-video-id-input'), {
      target: {value: 'new-video'},
    });
    fireEvent.click(screen.getByTestId('start-screen-open-button'));

    expect(await screen.findByTestId('workspace-header-video-id')).toHaveTextContent('new-video');
    expect(screen.getByTestId('workspace-header-mode')).toHaveTextContent('空の下書き');
    expect(screen.getByTestId('script-review-panel')).toBeInTheDocument();
    expect(screen.getByTestId('codex-panel')).toBeInTheDocument();
  });

  it('injects asset file access into the workspace editor', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createExistingWorkspace('sample-video', script),
    });
    const selectImage = vi.fn().mockResolvedValue(null);
    const assetFileAccess: AssetFileAccess = {
      copyImage: vi.fn(),
      exists: vi.fn().mockResolvedValue(true),
      selectImage,
      trash: vi.fn(),
    };

    render(<StudioApp assetFileAccess={assetFileAccess} />);
    fireEvent.click(await screen.findByTestId('project-list-item-sample-video'));
    fireEvent.click(await screen.findByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('scene-image-select-button'));
    await waitFor(() => expect(selectImage).toHaveBeenCalledOnce());
  });

  it('shows an error when an existing script cannot be opened', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'failed',
      error: {
        code: 'invalid-script',
        message: '台本JSONの形式が不正です。',
        targetPath: 'input/broken.json',
      },
    });

    render(<StudioApp />);

    fireEvent.change(screen.getByTestId('start-screen-new-video-id-input'), {
      target: {value: 'broken'},
    });
    fireEvent.click(screen.getByTestId('start-screen-open-button'));

    await waitFor(() => {
      expect(screen.getByTestId('workspace-open-error')).toHaveTextContent('台本JSONの形式が不正です。');
    });
  });

  it('loads an approved JSON proposal into the U3 draft editor', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createExistingWorkspace('sample-video', script),
    });
    const message = createChatMessage('assistant', 'JSON提案', {
      id: 'assistant-1',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    const proposal = extractProposals(
      message.id,
      'sample-video',
      '',
      [{kind: 'json-draft', script: {...script, title: 'Codex Proposal'}}],
      '2026-07-25T00:00:00.000Z',
    ).proposals[0];
    vi.spyOn(chatHistoryStore, 'loadChatHistory').mockResolvedValue({
      messages: [message],
      proposals: [proposal],
    });
    vi.spyOn(chatHistoryStore, 'saveChatHistory').mockResolvedValue();

    render(<StudioApp />);
    fireEvent.click(await screen.findByTestId('project-list-item-sample-video'));
    fireEvent.click(await screen.findByTestId('proposal-json-draft-approve'));

    await waitFor(() => {
      expect(screen.getByTestId('script-review-status-banner')).toHaveTextContent('Applyしてください');
    });
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));
    expect((screen.getByTestId('script-review-raw-json-input') as HTMLTextAreaElement).value)
      .toContain('"title": "Codex Proposal"');
  });

  it('marks a command proposal failed while U6 is unavailable', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createExistingWorkspace('sample-video', script),
    });
    const message = createChatMessage('assistant', 'Validate提案', {
      id: 'assistant-1',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    const proposal = extractProposals(
      message.id,
      'sample-video',
      '',
      [{kind: 'command', operation: 'validate'}],
      '2026-07-25T00:00:00.000Z',
    ).proposals[0];
    vi.spyOn(chatHistoryStore, 'loadChatHistory').mockResolvedValue({
      messages: [message],
      proposals: [proposal],
    });
    vi.spyOn(chatHistoryStore, 'saveChatHistory').mockResolvedValue();

    render(<StudioApp />);
    fireEvent.click(await screen.findByTestId('project-list-item-sample-video'));
    fireEvent.click(await screen.findByTestId('proposal-command-approve'));

    await waitFor(() => {
      expect(screen.getByTestId('proposal-command-status')).toHaveTextContent('failed');
      expect(screen.getByTestId('proposal-command-card')).toHaveTextContent('Command Runner未接続');
    });
  });

  it('runs an approved render proposal through the U8 gate and U6', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createExistingWorkspace('sample-video', script),
    });
    const message = createChatMessage('assistant', 'Render提案', {
      id: 'assistant-1',
      createdAt: '2026-07-25T00:00:00.000Z',
    });
    const proposal = extractProposals(
      message.id,
      'sample-video',
      '',
      [{kind: 'command', operation: 'render'}],
      '2026-07-25T00:00:00.000Z',
    ).proposals[0];
    vi.spyOn(chatHistoryStore, 'loadChatHistory').mockResolvedValue({messages: [message], proposals: [proposal]});
    vi.spyOn(chatHistoryStore, 'saveChatHistory').mockResolvedValue();
    let operationListener: ((operation: Operation) => void) | undefined;
    const running: Operation = {
      id: 'op-1',
      videoId: 'sample-video',
      command: 'render',
      phase: 'command',
      status: 'running',
      startedAt: '2026-07-26T00:00:00.000Z',
    };
    globalThis.commandApi = {
      start: vi.fn().mockResolvedValue(running),
      stop: vi.fn(),
      clearLogs: vi.fn(),
      snapshot: vi.fn().mockResolvedValue({operation: null, logs: []}),
      onOperation(listener) {
        operationListener = listener;
        return () => undefined;
      },
      onLog: vi.fn(() => () => undefined),
    } as CommandApi;
    const checkPreview = vi.fn().mockResolvedValue({
        source: {},
        readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
      });
    globalThis.previewApi = {
      check: checkPreview,
      load: vi.fn().mockResolvedValue({
        source: {},
        readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
        inputProps: {
          script,
          manifest: {videoId: 'sample-video', scenes: {}},
          timeline: {videoId: 'sample-video', fps: 30, totalFrames: 300, scenes: []},
        },
      }),
    } as never;
    globalThis.renderOutputApi = {
      status: vi.fn().mockResolvedValue({
        videoId: 'sample-video',
        outputPath: 'output/sample-video.mp4',
        exists: false,
        nonZero: false,
      }),
      confirmOverwrite: vi.fn(),
      reveal: vi.fn(),
    };

    render(<StudioApp />);
    fireEvent.click(await screen.findByTestId('project-list-item-sample-video'));
    fireEvent.click(await screen.findByTestId('proposal-command-approve'));
    await waitFor(() => expect(globalThis.commandApi?.start).toHaveBeenCalled());
    expect(checkPreview).toHaveBeenCalledWith('sample-video');
    await act(async () => {
      operationListener?.({...running, status: 'succeeded', endedAt: '2026-07-26T00:00:01.000Z'});
    });

    await waitFor(() => {
      expect(screen.getByTestId('proposal-command-status')).toHaveTextContent('completed');
    });
  });

  it('loads the embedded preview for the opened workspace', async () => {
    vi.spyOn(workspaceClient, 'listVideoProjects').mockResolvedValue([
      {videoId: 'sample-video', fileName: 'sample-video.json', filePath: 'input/sample-video.json'},
    ]);
    vi.spyOn(workspaceClient, 'loadWorkspace').mockResolvedValue({
      status: 'opened',
      workspace: createExistingWorkspace('sample-video', script),
    });
    const snapshot = {
      source: {
        videoId: 'sample-video',
        scriptModifiedAt: 1,
        manifestModifiedAt: 2,
        timelineModifiedAt: 3,
      },
      readiness: {ready: true, missing: [], stale: [], requiredOperations: []},
    } as const;
    globalThis.previewApi = {
      check: vi.fn().mockResolvedValue(snapshot),
      load: vi.fn().mockResolvedValue({
        ...snapshot,
        inputProps: {
          script,
          manifest: {videoId: 'sample-video', scenes: {}},
          timeline: {videoId: 'sample-video', fps: 30, totalFrames: 300, scenes: []},
        },
      }),
    };

    render(<StudioApp />);
    fireEvent.click(await screen.findByTestId('project-list-item-sample-video'));

    expect(await screen.findByTestId('preview-panel')).toBeInTheDocument();
    expect(await screen.findByText('プレビュー準備完了')).toBeInTheDocument();
    expect(globalThis.previewApi.check).toHaveBeenCalledWith('sample-video');
  });
});

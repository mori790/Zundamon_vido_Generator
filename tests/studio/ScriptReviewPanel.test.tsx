import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {ScriptReviewPanel} from '../../src/studio/renderer/ScriptReviewPanel';
import type {AssetFileAccess} from '../../src/studio/renderer/asset-file-access';
import {formatScriptJson} from '../../src/studio/shared/script-draft';
import type {ScriptFileAccess} from '../../src/studio/shared/script-apply';
import {extractProposals, type JsonDraftProposal} from '../../src/studio/shared/proposal';
import type {VideoScript} from '../../src/types/video';

function createScript(): VideoScript {
  return {
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
}

function createFileAccess(): ScriptFileAccess {
  const files = new Map<string, string>([['input/sample-video.json', '{"old":true}']]);
  return {
    async readFile(path) {
      return files.get(path) ?? '';
    },
    async writeFile(path, data) {
      files.set(path, data);
    },
  };
}

function createProposal(): JsonDraftProposal {
  return extractProposals(
    'assistant-1',
    'sample-video',
    '',
    [{kind: 'json-draft', script: {...createScript(), title: 'Codex Proposal'}}],
    '2026-07-25T00:00:00.000Z',
  ).proposals[0] as JsonDraftProposal;
}

function selectedImage(fileName = 'demo.png') {
  return {
    file: new File(['image'], fileName, {type: 'image/png'}),
    fileName,
    sourcePath: `/tmp/${fileName}`,
  };
}

function createAssetFileAccess(overrides: Partial<AssetFileAccess> = {}): AssetFileAccess {
  return {
    copyImage: vi.fn().mockResolvedValue({
      status: 'copied',
      publicPath: '/visuals/sample-video/demo.png',
    }),
    exists: vi.fn().mockResolvedValue(true),
    selectImage: vi.fn().mockResolvedValue(selectedImage()),
    trash: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ScriptReviewPanel', () => {
  it('shows existing script as read-only before draft creation', () => {
    render(<ScriptReviewPanel activeScript={createScript()} onApply={vi.fn()} videoId="sample-video" />);

    expect(screen.getByTestId('script-review-panel')).toBeInTheDocument();
    expect(screen.getByTestId('script-review-status-banner')).toHaveTextContent('読み取り専用');
    expect(screen.getByText('テストなのだ。')).toBeInTheDocument();
  });

  it('creates a draft and enables raw JSON editing', () => {
    render(<ScriptReviewPanel activeScript={createScript()} onApply={vi.fn()} videoId="sample-video" />);

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));

    const rawInput = screen.getByTestId('script-review-raw-json-input');
    expect(rawInput).not.toHaveAttribute('readonly');
    expect((rawInput as HTMLTextAreaElement).value).toContain('"title": "Sample"');
  });

  it('disables Apply when raw JSON is invalid', async () => {
    render(<ScriptReviewPanel activeScript={createScript()} onApply={vi.fn()} videoId="sample-video" />);

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));
    fireEvent.change(screen.getByTestId('script-review-raw-json-input'), {
      target: {value: '{"id":'},
    });

    expect(screen.getByTestId('script-review-apply-button')).toBeDisabled();
    expect(await screen.findByTestId('script-review-validation-issues')).toHaveTextContent('Unexpected end');
  });

  it('updates raw JSON from structured scene edit', () => {
    render(<ScriptReviewPanel activeScript={createScript()} onApply={vi.fn()} videoId="sample-video" />);

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.change(screen.getByTestId('scene-text-input'), {
      target: {value: '更新したのだ。'},
    });
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));

    expect((screen.getByTestId('script-review-raw-json-input') as HTMLTextAreaElement).value).toContain(
      '更新したのだ。',
    );
  });

  it('applies a valid draft and reports applied script', async () => {
    const onApply = vi.fn();
    render(
      <ScriptReviewPanel
        activeScript={createScript()}
        fileAccess={createFileAccess()}
        onApply={onApply}
        videoId="sample-video"
      />,
    );

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));
    fireEvent.change(screen.getByTestId('script-review-raw-json-input'), {
      target: {value: formatScriptJson({...createScript(), title: 'Updated'})},
    });
    fireEvent.click(screen.getByTestId('script-review-apply-button'));

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith(expect.objectContaining({title: 'Updated'}));
    });
    expect(screen.getByTestId('script-review-status-banner')).toHaveTextContent('保存しました');
  });

  it('loads an approved proposal as a draft without saving the canonical script', async () => {
    const fileAccess = {readFile: vi.fn(), writeFile: vi.fn()};
    const onLoaded = vi.fn();
    render(
      <ScriptReviewPanel
        activeScript={createScript()}
        fileAccess={fileAccess}
        onAcceptProposal={vi.fn().mockResolvedValue(true)}
        onApply={vi.fn()}
        onProposalLoaded={onLoaded}
        proposal={createProposal()}
        videoId="sample-video"
      />,
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));
    expect((screen.getByTestId('script-review-raw-json-input') as HTMLTextAreaElement).value)
      .toContain('"title": "Codex Proposal"');
    expect(fileAccess.writeFile).not.toHaveBeenCalled();
    expect(screen.getByTestId('script-review-status-banner')).toHaveTextContent('Applyしてください');
  });

  it('requires confirmation before replacing an existing draft', async () => {
    const onAccept = vi.fn().mockResolvedValue(true);
    const onDismiss = vi.fn();
    const proposal = createProposal();
    const activeScript = createScript();
    const {rerender} = render(
      <ScriptReviewPanel activeScript={activeScript} onApply={vi.fn()} videoId="sample-video" />,
    );
    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));

    rerender(
      <ScriptReviewPanel
        activeScript={activeScript}
        onAcceptProposal={onAccept}
        onApply={vi.fn()}
        onDismissProposal={onDismiss}
        proposal={proposal}
        videoId="sample-video"
      />,
    );

    expect(screen.getByTestId('script-review-proposal-confirmation')).toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('script-review-proposal-cancel-button'));
    expect(onDismiss).toHaveBeenCalledWith(proposal.id);
    fireEvent.click(screen.getByTestId('script-review-proposal-confirm-button'));
    await waitFor(() => expect(onAccept).toHaveBeenCalledWith(proposal));
  });

  it('attaches an image and edits position and fit through the existing draft', async () => {
    const assetFileAccess = createAssetFileAccess();
    render(
      <ScriptReviewPanel
        activeScript={createScript()}
        assetFileAccess={assetFileAccess}
        onApply={vi.fn()}
        videoId="sample-video"
      />,
    );

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('scene-image-select-button'));
    expect(await screen.findByTestId('scene-image-path')).toHaveTextContent(
      '/visuals/sample-video/demo.png',
    );
    fireEvent.change(screen.getByTestId('scene-image-position-select'), {target: {value: 'right'}});
    fireEvent.change(screen.getByTestId('scene-image-fit-select'), {target: {value: 'cover'}});
    fireEvent.click(screen.getByTestId('script-review-raw-tab'));
    const raw = (screen.getByTestId('script-review-raw-json-input') as HTMLTextAreaElement).value;
    expect(raw).toContain('"position": "right"');
    expect(raw).toContain('"fit": "cover"');
    await waitFor(() =>
      expect(assetFileAccess.exists).toHaveBeenCalledWith('/visuals/sample-video/demo.png'),
    );
  });

  it('requires confirmation before replacing a colliding image', async () => {
    const copyImage = vi
      .fn()
      .mockResolvedValueOnce({
        status: 'replacement-required',
        publicPath: '/visuals/sample-video/demo.png',
      })
      .mockResolvedValueOnce({
        status: 'copied',
        publicPath: '/visuals/sample-video/demo.png',
      });
    render(
      <ScriptReviewPanel
        activeScript={createScript()}
        assetFileAccess={createAssetFileAccess({copyImage})}
        onApply={vi.fn()}
        videoId="sample-video"
      />,
    );

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('scene-image-select-button'));
    expect(await screen.findByTestId('asset-replacement-confirmation')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('asset-replacement-confirm-button'));
    expect(await screen.findByTestId('scene-image-path')).toBeInTheDocument();
    expect(copyImage).toHaveBeenLastCalledWith(
      'sample-video',
      expect.objectContaining({fileName: 'demo.png'}),
      true,
    );
  });

  it('shows missing assets and preserves a file when Trash fails', async () => {
    const activeScript = createScript();
    activeScript.scenes[0].visual = {
      type: 'image',
      src: '/visuals/sample-video/missing.png',
      position: 'center',
      fit: 'contain',
    };
    const trash = vi.fn().mockRejectedValue(new Error('Trash failed'));
    render(
      <ScriptReviewPanel
        activeScript={activeScript}
        assetFileAccess={createAssetFileAccess({
          exists: vi.fn().mockResolvedValue(false),
          trash,
        })}
        onApply={vi.fn()}
        videoId="sample-video"
      />,
    );

    expect(await screen.findByTestId('scene-image-missing-notice')).toHaveTextContent('Missing image');
    expect(screen.getByTestId('scene-row-scene-001')).toHaveTextContent('Missing image');
    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('scene-image-remove-button'));
    expect(screen.getByTestId('asset-removal-confirmation')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('asset-removal-trash-button'));
    expect(await screen.findByTestId('asset-operation-error')).toHaveTextContent('ファイルは残っています');
    expect(trash).toHaveBeenCalledWith('/visuals/sample-video/missing.png');
  });

  it('offers manual retry after copy failure', async () => {
    const copyImage = vi
      .fn()
      .mockResolvedValueOnce({status: 'failed', message: 'Copy failed'})
      .mockResolvedValueOnce({
        status: 'copied',
        publicPath: '/visuals/sample-video/demo.png',
      });
    render(
      <ScriptReviewPanel
        activeScript={createScript()}
        assetFileAccess={createAssetFileAccess({copyImage})}
        onApply={vi.fn()}
        videoId="sample-video"
      />,
    );

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    fireEvent.click(screen.getByTestId('scene-image-select-button'));
    expect(await screen.findByTestId('asset-operation-error')).toHaveTextContent('Copy failed');
    fireEvent.click(screen.getByTestId('asset-operation-retry-button'));
    expect(await screen.findByTestId('scene-image-path')).toBeInTheDocument();
  });

  it('allows only one asset selection operation at a time', async () => {
    let finishSelection: ((value: ReturnType<typeof selectedImage> | null) => void) | undefined;
    const selectImage = vi.fn(
      () =>
        new Promise<ReturnType<typeof selectedImage> | null>((resolve) => {
          finishSelection = resolve;
        }),
    );
    render(
      <ScriptReviewPanel
        activeScript={createScript()}
        assetFileAccess={createAssetFileAccess({selectImage})}
        onApply={vi.fn()}
        videoId="sample-video"
      />,
    );

    fireEvent.click(screen.getByTestId('script-review-create-draft-button'));
    const selectButton = screen.getByTestId('scene-image-select-button');
    fireEvent.click(selectButton);
    fireEvent.click(selectButton);
    expect(selectImage).toHaveBeenCalledOnce();
    finishSelection?.(null);
    await waitFor(() => expect(selectButton).not.toBeDisabled());
  });
});

import '@testing-library/jest-dom/vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {ScriptReviewPanel} from '../../src/studio/renderer/ScriptReviewPanel';
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
});

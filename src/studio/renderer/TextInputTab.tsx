import {useEffect, useRef, useState} from 'react';
import {validateTextInput, type TextInputState} from '../shared/text-input-draft';
import type {TextInputDraft} from '../shared/text-input-draft';
import type {LocalFileApi} from '../shared/local-file';
import {type Scene, type SceneDraft, type SceneSegmentationApi} from '../shared/scene-segmentation';
import {CODEX_MAX_PROMPT_BYTES} from '../shared/codex-app-server';
import {TextInputArea} from './TextInputArea';
import {FileLoadButton} from './FileLoadButton';
import {SegmentationButton} from './SegmentationButton';
import {TextInputStatusMessage} from './TextInputStatusMessage';

declare global {
  var localFileApi: LocalFileApi | undefined;
  var sceneSegmentationApi: SceneSegmentationApi | undefined;
}

const DEBOUNCE_MS = 500;

type SegmentationMeta = {draftText: string; segmentedAt: string};

type Props = {
  workspaceRoot: string | null;
  videoId: string | null;
  onSegmentationComplete(scenes: Scene[], meta: SegmentationMeta): void;
};

export function TextInputTab({workspaceRoot, videoId, onSegmentationComplete}: Props): JSX.Element {
  const [state, setState] = useState<TextInputState>({
    draftText: '',
    status: 'idle',
    errorMessage: null,
  });
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateTextInput> | null>(null);

  // Restore draft on workspace open
  useEffect(() => {
    if (!workspaceRoot || !videoId) return;
    const api = globalThis.localFileApi;
    if (!api) return;
    let active = true;
    api.draft.read(videoId).then((raw) => {
      if (!active || !raw) return;
      try {
        const draft = JSON.parse(raw) as TextInputDraft;
        setState((prev) => ({...prev, draftText: draft.draftText, status: draft.draftText.trim() ? 'has-text' : 'idle'}));
      } catch {
        console.error('[TextInputTab] draft parse error');
      }
    }).catch((err) => {
      console.error('[TextInputTab] draft load error', err);
    });
    return () => { active = false; };
  }, [workspaceRoot, videoId]);

  // 500ms debounce draft save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!workspaceRoot || !videoId) return;
    const api = globalThis.localFileApi;
    if (!api) return;

    saveTimerRef.current = setTimeout(() => {
      const draft: TextInputDraft = {draftText: state.draftText, savedAt: new Date().toISOString()};
      api.draft.write(videoId, JSON.stringify(draft)).catch((err) => {
        console.error('[TextInputTab] draft save error', err);
      });
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.draftText, workspaceRoot, videoId]);

  function handleTextChange(text: string) {
    setValidationResult(null);
    setState((prev) => ({
      ...prev,
      draftText: text,
      status: text.trim() ? 'has-text' : 'idle',
      errorMessage: null,
    }));
  }

  async function handleSegmentationStart() {
    const result = validateTextInput({draftText: state.draftText, workspaceRoot});
    if (!result.ok) {
      setValidationResult(result);
      return;
    }

    if (!videoId) {
      setState((prev) => ({...prev, status: 'segmentation-error', errorMessage: 'Workspaceを開いてからシーンに分割してください。'}));
      return;
    }

    if (new TextEncoder().encode(state.draftText).byteLength > CODEX_MAX_PROMPT_BYTES) {
      setState((prev) => ({...prev, status: 'segmentation-error', errorMessage: '草案テキストが大きすぎます（64KB以下にしてください）。'}));
      return;
    }

    const api = globalThis.sceneSegmentationApi;
    if (!api) {
      setState((prev) => ({...prev, status: 'segmentation-error', errorMessage: 'シーン分割機能を利用できません（Electron環境が必要です）。'}));
      return;
    }

    setValidationResult(null);
    setState((prev) => ({...prev, status: 'segmenting', errorMessage: null}));

    const currentText = state.draftText;
    const segResult = await api.segment(currentText, videoId);

    if (!segResult.ok) {
      setState((prev) => ({...prev, status: 'segmentation-error', errorMessage: segResult.message}));
      return;
    }

    const localApi = globalThis.localFileApi;
    if (localApi) {
      const sceneDraft: SceneDraft = {
        draftText: currentText,
        savedAt: new Date().toISOString(),
        scenes: segResult.scenes,
        segmentedAt: new Date().toISOString(),
      };
      localApi.draft.write(videoId, JSON.stringify(sceneDraft)).catch((err: unknown) => {
        console.error('[TextInputTab] scene draft save error', err);
      });
    }

    setState((prev) => ({...prev, status: 'has-text', errorMessage: null}));
    onSegmentationComplete(segResult.scenes, {draftText: currentText, segmentedAt: new Date().toISOString()});
  }

  const isProcessing = state.status === 'segmenting';

  return (
    <section className="workspace-card" data-testid="text-input-tab">
      <h2>テキスト入力</h2>
      <p className="muted">草案テキストを入力してシーンに分割します。</p>
      <TextInputArea
        disabled={isProcessing}
        onChange={handleTextChange}
        value={state.draftText}
      />
      <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
        <FileLoadButton
          disabled={isProcessing}
          existingText={state.draftText}
          onLoad={handleTextChange}
        />
        <SegmentationButton
          onStart={handleSegmentationStart}
          status={state.status}
          text={state.draftText}
          workspaceSelected={Boolean(workspaceRoot && videoId)}
        />
      </div>
      <TextInputStatusMessage
        errorMessage={state.errorMessage}
        validationResult={validationResult}
      />
    </section>
  );
}

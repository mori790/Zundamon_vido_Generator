import {useEffect, useMemo, useRef, useState} from 'react';
import type {Scene, VideoScript} from '../../types/video';
import {
  checkSceneAssets,
  collectSceneImageReferences,
  isAssetReferenced,
  type SceneAssetStatus,
  type SelectedImage,
} from '../shared/asset';
import {applyScriptDraft, type ScriptFileAccess} from '../shared/script-apply';
import {
  addDraftScene,
  createDraftFromScript,
  createEmptyScriptDraft,
  emotions,
  moveDraftScene,
  removeDraftScene,
  sceneTypes,
  updateDraftRawJson,
  updateDraftScene,
  type DraftViewMode,
  type ScriptDraft,
} from '../shared/script-draft';
import type {JsonDraftProposal} from '../shared/proposal';
import {createRendererAssetFileAccess, type AssetFileAccess} from './asset-file-access';
import {createRendererScriptFileAccess} from './script-file-access';

type ScriptReviewPanelProps = {
  videoId: string;
  activeScript: VideoScript | null;
  assetFileAccess?: AssetFileAccess;
  onApply(script: VideoScript): void;
  fileAccess?: ScriptFileAccess;
  proposal?: JsonDraftProposal | null;
  onAcceptProposal?(proposal: JsonDraftProposal): Promise<boolean>;
  onProposalLoaded?(proposalId: string): Promise<void> | void;
  onDismissProposal?(proposalId: string): void;
};

export function ScriptReviewPanel({
  videoId,
  activeScript,
  assetFileAccess,
  onApply,
  fileAccess,
  proposal,
  onAcceptProposal,
  onProposalLoaded,
  onDismissProposal,
}: ScriptReviewPanelProps): JSX.Element {
  const [draft, setDraft] = useState<ScriptDraft | null>(null);
  const [viewMode, setViewMode] = useState<DraftViewMode>('structured');
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(activeScript?.scenes[0]?.id ?? null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [loadingProposal, setLoadingProposal] = useState(false);
  const [assetStatuses, setAssetStatuses] = useState<SceneAssetStatus[]>([]);
  const [assetBusy, setAssetBusy] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [pendingReplacement, setPendingReplacement] = useState<{
    sceneId: string;
    selected: SelectedImage;
  } | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [retryRequest, setRetryRequest] = useState<{
    overwrite: boolean;
    sceneId: string;
    selected: SelectedImage;
  } | null>(null);
  const assetBusyRef = useRef(false);
  const assetCheckGenerationRef = useRef(0);
  const resolvedAssetFileAccess = useMemo(
    () => assetFileAccess ?? createRendererAssetFileAccess(),
    [assetFileAccess],
  );

  useEffect(() => {
    setDraft(null);
    setSelectedSceneId(activeScript?.scenes[0]?.id ?? null);
    setApplyMessage(null);
  }, [activeScript, videoId]);

  useEffect(() => {
    if (!proposal || draft || loadingProposal) {
      return;
    }
    void loadProposal(proposal);
  }, [draft, loadingProposal, proposal]);

  const displayedScript = draft?.lastValidScript ?? activeScript;
  const selectedScene = displayedScript?.scenes.find((scene) => scene.id === selectedSceneId) ?? displayedScript?.scenes[0] ?? null;
  const canApply = Boolean(draft && draft.validation.status === 'valid' && !applying);

  useEffect(() => {
    const generation = ++assetCheckGenerationRef.current;
    if (!displayedScript) {
      setAssetStatuses((current) => (current.length === 0 ? current : []));
      return;
    }
    if (collectSceneImageReferences(displayedScript).length === 0) {
      setAssetStatuses((current) => (current.length === 0 ? current : []));
      return;
    }
    void checkSceneAssets(displayedScript, resolvedAssetFileAccess.exists, generation).then((result) => {
      if (result.generation === assetCheckGenerationRef.current) {
        setAssetStatuses(result.statuses);
      }
    });
  }, [displayedScript, resolvedAssetFileAccess]);

  function createDraft() {
    const nextDraft = activeScript ? createDraftFromScript(videoId, activeScript) : createEmptyScriptDraft(videoId);
    setDraft(nextDraft);
    setSelectedSceneId(nextDraft.lastValidScript?.scenes[0]?.id ?? null);
    setApplyMessage(null);
  }

  function discardDraft() {
    setDraft(null);
    setSelectedSceneId(activeScript?.scenes[0]?.id ?? null);
    setApplyMessage(null);
  }

  function changeRawJson(rawJson: string) {
    if (!draft) {
      return;
    }
    const nextDraft = updateDraftRawJson(draft, rawJson);
    setDraft(nextDraft);
    if (!selectedSceneId && nextDraft.lastValidScript?.scenes[0]) {
      setSelectedSceneId(nextDraft.lastValidScript.scenes[0].id);
    }
  }

  function patchScene(sceneId: string, patch: Parameters<typeof updateDraftScene>[2]) {
    if (!draft) {
      return;
    }
    const nextDraft = updateDraftScene(draft, sceneId, patch);
    setDraft(nextDraft);
    if (patch.id && typeof patch.id === 'string') {
      setSelectedSceneId(patch.id);
    }
  }

  async function selectImage(sceneId: string) {
    if (assetBusyRef.current) {
      return;
    }
    assetBusyRef.current = true;
    setAssetBusy(true);
    setAssetError(null);
    try {
      const selected = await resolvedAssetFileAccess.selectImage();
      assetBusyRef.current = false;
      setAssetBusy(false);
      if (selected) {
        await copyImage(sceneId, selected, false);
      }
    } catch (error) {
      setAssetError(error instanceof Error ? error.message : '画像を選択できませんでした。');
    } finally {
      assetBusyRef.current = false;
      setAssetBusy(false);
    }
  }

  async function copyImage(sceneId: string, selected: SelectedImage, overwrite: boolean) {
    if (assetBusyRef.current) {
      return;
    }
    assetBusyRef.current = true;
    setAssetBusy(true);
    setAssetError(null);
    const result = await resolvedAssetFileAccess.copyImage(videoId, selected, overwrite);
    assetBusyRef.current = false;
    setAssetBusy(false);

    if (result.status === 'replacement-required') {
      setPendingReplacement({sceneId, selected});
      return;
    }
    if (result.status === 'failed') {
      setRetryRequest({overwrite, sceneId, selected});
      setAssetError(result.message);
      return;
    }

    const current = displayedScript?.scenes.find((scene) => scene.id === sceneId);
    patchScene(sceneId, {
      visual: {
        type: 'image',
        src: result.publicPath,
        position: current?.visual?.type === 'image' ? current.visual.position : 'center',
        fit: current?.visual?.type === 'image' ? current.visual.fit : 'contain',
      },
    });
    setPendingReplacement(null);
    setRetryRequest(null);
  }

  function removeImage(sceneId: string) {
    const script = draft?.lastValidScript;
    const scene = script?.scenes.find((candidate) => candidate.id === sceneId);
    if (!script || scene?.visual?.type !== 'image') {
      return;
    }
    const publicPath = scene.visual.src;
    const nextScript = {
      ...script,
      scenes: script.scenes.map((candidate) =>
        candidate.id === sceneId ? {...candidate, visual: undefined} : candidate,
      ),
    };
    patchScene(sceneId, {visual: undefined});
    setPendingRemoval(isAssetReferenced(nextScript, publicPath) ? null : publicPath);
  }

  async function movePendingImageToTrash() {
    if (!pendingRemoval || assetBusyRef.current) {
      return;
    }
    assetBusyRef.current = true;
    setAssetBusy(true);
    setAssetError(null);
    try {
      await resolvedAssetFileAccess.trash(pendingRemoval);
      setPendingRemoval(null);
    } catch (error) {
      setAssetError(
        `${error instanceof Error ? error.message : '画像をTrashへ移動できませんでした。'} ファイルは残っています。`,
      );
    } finally {
      assetBusyRef.current = false;
      setAssetBusy(false);
    }
  }

  function addScene() {
    if (!draft) {
      return;
    }
    const nextDraft = addDraftScene(draft, selectedSceneId ?? undefined);
    setDraft(nextDraft);
    const scenes = nextDraft.lastValidScript?.scenes ?? [];
    setSelectedSceneId(scenes[scenes.length - 1]?.id ?? null);
  }

  function removeScene() {
    if (!draft || !selectedSceneId) {
      return;
    }
    const nextDraft = removeDraftScene(draft, selectedSceneId);
    setDraft(nextDraft);
    setSelectedSceneId(nextDraft.lastValidScript?.scenes[0]?.id ?? null);
  }

  function moveScene(direction: 'up' | 'down') {
    if (!draft || !selectedSceneId) {
      return;
    }
    setDraft(moveDraftScene(draft, selectedSceneId, direction));
  }

  async function loadProposal(nextProposal: JsonDraftProposal) {
    setLoadingProposal(true);
    const accepted = await (onAcceptProposal?.(nextProposal) ?? Promise.resolve(true));
    if (accepted) {
      const nextDraft = createDraftFromScript(videoId, nextProposal.script);
      setDraft(nextDraft);
      setSelectedSceneId(nextDraft.lastValidScript?.scenes[0]?.id ?? null);
      setApplyMessage('Codex提案を下書きへ読み込みました。内容を確認してApplyしてください。');
      await onProposalLoaded?.(nextProposal.id);
    }
    setLoadingProposal(false);
  }

  async function applyDraft() {
    if (!draft) {
      return;
    }
    setApplying(true);
    const access = fileAccess ?? createRendererScriptFileAccess();
    const result = await applyScriptDraft(videoId, draft.rawJson, access);
    setApplying(false);

    if (result.status === 'failed') {
      setApplyMessage(result.error.message);
      return;
    }

    onApply(result.script);
    setDraft(null);
    setSelectedSceneId(result.script.scenes[0]?.id ?? null);
    setApplyMessage(`保存しました: ${result.scriptPath}`);
  }

  return (
    <section
      aria-busy={assetBusy}
      className="script-review-panel"
      data-testid="script-review-panel"
    >
      <header className="script-review-header">
        <div>
          <h2>台本レビュー</h2>
          <p>{draft ? '下書き編集中' : activeScript ? '既存台本を読み取り専用で表示中' : '台本はまだありません'}</p>
        </div>
        <div className="script-review-actions">
          {!draft ? (
            <button data-testid="script-review-create-draft-button" onClick={createDraft} type="button">
              下書き作成
            </button>
          ) : (
            <>
              <button data-testid="script-review-discard-button" onClick={discardDraft} type="button">
                破棄
              </button>
              <button
                data-testid="script-review-apply-button"
                disabled={!canApply}
                onClick={applyDraft}
                type="button"
              >
                {applying ? '保存中' : 'Apply'}
              </button>
            </>
          )}
        </div>
      </header>

      <StatusBanner activeScript={activeScript} applyMessage={applyMessage} draft={draft} />

      {proposal && draft ? (
        <div className="proposal-confirmation" data-testid="script-review-proposal-confirmation" role="alertdialog">
          <strong>編集中の下書きをCodex提案で置き換えますか？</strong>
          <p>現在の未適用の編集内容は失われます。</p>
          <div>
            <button
              data-testid="script-review-proposal-cancel-button"
              onClick={() => onDismissProposal?.(proposal.id)}
              type="button"
            >
              Cancel
            </button>
            <button
              data-testid="script-review-proposal-confirm-button"
              disabled={loadingProposal}
              onClick={() => void loadProposal(proposal)}
              type="button"
            >
              {loadingProposal ? '読込中' : '置き換える'}
            </button>
          </div>
        </div>
      ) : null}

      {pendingReplacement ? (
        <div className="asset-confirmation" data-testid="asset-replacement-confirmation" role="alertdialog">
          <strong>同名の画像を置き換えますか？</strong>
          <p>{pendingReplacement.selected.fileName}</p>
          <div>
            <button
              data-testid="asset-replacement-cancel-button"
              onClick={() => setPendingReplacement(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              data-testid="asset-replacement-confirm-button"
              disabled={assetBusy}
              onClick={() =>
                void copyImage(pendingReplacement.sceneId, pendingReplacement.selected, true)
              }
              type="button"
            >
              Replace
            </button>
          </div>
        </div>
      ) : null}

      {pendingRemoval ? (
        <div className="asset-confirmation" data-testid="asset-removal-confirmation" role="alertdialog">
          <strong>参照されていない画像をTrashへ移動しますか？</strong>
          <p>{pendingRemoval}</p>
          <div>
            <button
              data-testid="asset-removal-keep-button"
              onClick={() => setPendingRemoval(null)}
              type="button"
            >
              Keep File
            </button>
            <button
              data-testid="asset-removal-trash-button"
              disabled={assetBusy}
              onClick={() => void movePendingImageToTrash()}
              type="button"
            >
              Move to Trash
            </button>
          </div>
        </div>
      ) : null}

      {assetError ? (
        <div className="asset-error" data-testid="asset-operation-error" role="alert">
          <span>{assetError}</span>
          {retryRequest ? (
            <button
              data-testid="asset-operation-retry-button"
              disabled={assetBusy}
              onClick={() =>
                void copyImage(
                  retryRequest.sceneId,
                  retryRequest.selected,
                  retryRequest.overwrite,
                )
              }
              type="button"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {displayedScript ? (
        <>
          <div className="script-review-tabs" role="tablist">
            <button
              aria-selected={viewMode === 'structured'}
              data-testid="script-review-scenes-tab"
              onClick={() => setViewMode('structured')}
              role="tab"
              type="button"
            >
              Scenes
            </button>
            <button
              aria-selected={viewMode === 'raw'}
              data-testid="script-review-raw-tab"
              onClick={() => setViewMode('raw')}
              role="tab"
              type="button"
            >
              Raw JSON
            </button>
          </div>

          {viewMode === 'raw' ? (
            <RawJsonEditor draft={draft} script={displayedScript} onChange={changeRawJson} />
          ) : (
            <StructuredSceneEditor
              draft={draft}
              assetBusy={assetBusy}
              assetStatuses={assetStatuses}
              onAdd={addScene}
              onAttachImage={selectImage}
              onMove={moveScene}
              onPatchScene={patchScene}
              onRemoveImage={removeImage}
              onRemove={removeScene}
              onSelectScene={setSelectedSceneId}
              script={displayedScript}
              selectedScene={selectedScene}
            />
          )}

          <ValidationIssueList draft={draft} />
        </>
      ) : (
        <div className="script-empty-state" data-testid="script-review-empty-state">
          <p>下書きを作成すると、Raw JSONとシーン編集を開始できます。</p>
        </div>
      )}
    </section>
  );
}

function StatusBanner({
  activeScript,
  applyMessage,
  draft,
}: {
  activeScript: VideoScript | null;
  applyMessage: string | null;
  draft: ScriptDraft | null;
}): JSX.Element {
  let text = activeScript ? '既存台本を読み取り専用で表示しています。' : '新しい台本を作成できます。';
  let kind = 'info';

  if (draft?.status === 'draft') {
    text = '下書き編集中です。Applyするまでinput配下の台本は変更されません。';
  }
  if (draft?.status === 'invalid') {
    text = 'Raw JSONまたはスキーマが無効です。最後に有効だった構造化ビューを表示しています。';
    kind = 'warning';
  }
  if (applyMessage) {
    text = applyMessage;
    kind = applyMessage.startsWith('保存しました') ? 'success' : 'warning';
  }

  return (
    <div className={`script-status-banner ${kind}`} data-testid="script-review-status-banner">
      {text}
    </div>
  );
}

function RawJsonEditor({
  draft,
  onChange,
  script,
}: {
  draft: ScriptDraft | null;
  onChange(rawJson: string): void;
  script: VideoScript;
}): JSX.Element {
  return (
    <label className="script-raw-editor">
      <span className="field-label">Raw JSON</span>
      <textarea
        data-testid="script-review-raw-json-input"
        onChange={(event) => onChange(event.target.value)}
        readOnly={!draft}
        rows={18}
        value={draft?.rawJson ?? JSON.stringify(script, null, 2)}
      />
    </label>
  );
}

function StructuredSceneEditor({
  assetBusy,
  assetStatuses,
  draft,
  onAdd,
  onAttachImage,
  onMove,
  onPatchScene,
  onRemoveImage,
  onRemove,
  onSelectScene,
  script,
  selectedScene,
}: {
  assetBusy: boolean;
  assetStatuses: SceneAssetStatus[];
  draft: ScriptDraft | null;
  onAdd(): void;
  onAttachImage(sceneId: string): void;
  onMove(direction: 'up' | 'down'): void;
  onPatchScene(sceneId: string, patch: Parameters<typeof updateDraftScene>[2]): void;
  onRemoveImage(sceneId: string): void;
  onRemove(): void;
  onSelectScene(sceneId: string): void;
  script: VideoScript;
  selectedScene: Scene | null;
}): JSX.Element {
  const editable = Boolean(draft && draft.status !== 'invalid');
  const stale = draft?.status === 'invalid';

  return (
    <div className="structured-scene-editor" data-testid="structured-scene-editor">
      {stale ? (
        <div className="script-status-banner warning" data-testid="structured-scene-stale-banner">
          最後に有効だったJSONのシーンを表示しています。
        </div>
      ) : null}
      <div className="scene-editor-grid">
        <div className="scene-list">
          <div className="scene-list-header">
            <strong>Scenes</strong>
            {draft ? (
              <button data-testid="scene-add-button" onClick={onAdd} type="button">
                Add
              </button>
            ) : null}
          </div>
          {script.scenes.map((scene) => (
            <button
              className={scene.id === selectedScene?.id ? 'scene-row selected' : 'scene-row'}
              data-testid={`scene-row-${scene.id}`}
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              type="button"
            >
              <span>{scene.id}</span>
              <small>{scene.type}</small>
              {assetStatuses.some(
                (status) => status.sceneId === scene.id && status.status !== 'available',
              ) ? <small className="asset-missing-label">Missing image</small> : null}
            </button>
          ))}
        </div>

        {selectedScene ? (
          <div className="scene-detail" data-testid="scene-detail-panel">
            <div className="scene-detail-actions">
              <button disabled={!draft} onClick={() => onMove('up')} type="button">
                Up
              </button>
              <button disabled={!draft} onClick={() => onMove('down')} type="button">
                Down
              </button>
              <button disabled={!draft || script.scenes.length <= 1} onClick={onRemove} type="button">
                Remove
              </button>
            </div>
            <SceneField label="Scene ID">
              <input
                data-testid="scene-id-input"
                onChange={(event) => onPatchScene(selectedScene.id, {id: event.target.value})}
                readOnly={!editable}
                value={selectedScene.id}
              />
            </SceneField>
            <SceneField label="Type">
              <select
                data-testid="scene-type-select"
                disabled={!editable}
                onChange={(event) => onPatchScene(selectedScene.id, {type: event.target.value as Scene['type']})}
                value={selectedScene.type}
              >
                {sceneTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </SceneField>
            <SceneField label="Text">
              <textarea
                data-testid="scene-text-input"
                onChange={(event) => onPatchScene(selectedScene.id, {text: event.target.value})}
                readOnly={!editable}
                rows={4}
                value={selectedScene.text}
              />
            </SceneField>
            <SceneField label="Emotion">
              <select
                data-testid="scene-emotion-select"
                disabled={!editable}
                onChange={(event) => onPatchScene(selectedScene.id, {emotion: event.target.value as Scene['emotion']})}
                value={selectedScene.emotion}
              >
                {emotions.map((emotion) => (
                  <option key={emotion} value={emotion}>
                    {emotion}
                  </option>
                ))}
              </select>
            </SceneField>
            <SceneField label="Character Visible">
              <input
                checked={selectedScene.characterVisible}
                data-testid="scene-character-visible-input"
                disabled={!editable}
                onChange={(event) => onPatchScene(selectedScene.id, {characterVisible: event.target.checked})}
                type="checkbox"
              />
            </SceneField>
            <div className="scene-number-grid">
              <SceneField label="Before">
                <input
                  data-testid="scene-before-input"
                  min="0"
                  onChange={(event) =>
                    onPatchScene(selectedScene.id, {durationBeforeSpeech: Number(event.target.value)})
                  }
                  readOnly={!editable}
                  step="0.1"
                  type="number"
                  value={selectedScene.durationBeforeSpeech}
                />
              </SceneField>
              <SceneField label="After">
                <input
                  data-testid="scene-after-input"
                  min="0"
                  onChange={(event) =>
                    onPatchScene(selectedScene.id, {durationAfterSpeech: Number(event.target.value)})
                  }
                  readOnly={!editable}
                  step="0.1"
                  type="number"
                  value={selectedScene.durationAfterSpeech}
                />
              </SceneField>
            </div>
            <ImageVisualEditor
              assetBusy={assetBusy}
              editable={editable}
              onAttach={() => onAttachImage(selectedScene.id)}
              onPatch={(visual) => onPatchScene(selectedScene.id, {visual})}
              onRemove={() => onRemoveImage(selectedScene.id)}
              scene={selectedScene}
              status={assetStatuses.find((candidate) => candidate.sceneId === selectedScene.id)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ImageVisualEditor({
  assetBusy,
  editable,
  onAttach,
  onPatch,
  onRemove,
  scene,
  status,
}: {
  assetBusy: boolean;
  editable: boolean;
  onAttach(): void;
  onPatch(visual: Extract<NonNullable<Scene['visual']>, {type: 'image'}>): void;
  onRemove(): void;
  scene: Scene;
  status?: SceneAssetStatus;
}): JSX.Element {
  const visual = scene.visual?.type === 'image' ? scene.visual : null;

  return (
    <div className="image-visual-editor" data-testid="scene-image-visual-editor">
      <strong>Image Visual</strong>
      {!visual ? (
        <button
          data-testid="scene-image-select-button"
          disabled={!editable || assetBusy}
          onClick={onAttach}
          type="button"
        >
          {assetBusy ? '処理中' : 'Select Image'}
        </button>
      ) : (
        <>
          <code data-testid="scene-image-path">{visual.src}</code>
          {status?.status !== 'available' ? (
            <div className="asset-missing-notice" data-testid="scene-image-missing-notice" role="alert">
              Missing image: {status?.publicPath ?? visual.src}
            </div>
          ) : null}
          <div className="scene-number-grid">
            <SceneField label="Position">
              <select
                data-testid="scene-image-position-select"
                disabled={!editable || assetBusy}
                onChange={(event) =>
                  onPatch({...visual, position: event.target.value as typeof visual.position})
                }
                value={visual.position}
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>
            </SceneField>
            <SceneField label="Fit">
              <select
                data-testid="scene-image-fit-select"
                disabled={!editable || assetBusy}
                onChange={(event) =>
                  onPatch({...visual, fit: event.target.value as typeof visual.fit})
                }
                value={visual.fit}
              >
                <option value="contain">contain</option>
                <option value="cover">cover</option>
              </select>
            </SceneField>
          </div>
          <div className="scene-detail-actions">
            <button
              data-testid="scene-image-replace-button"
              disabled={!editable || assetBusy}
              onClick={onAttach}
              type="button"
            >
              Replace
            </button>
            <button
              data-testid="scene-image-remove-button"
              disabled={!editable || assetBusy}
              onClick={onRemove}
              type="button"
            >
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SceneField({children, label}: {children: React.ReactNode; label: string}): JSX.Element {
  return (
    <label className="scene-field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

function ValidationIssueList({draft}: {draft: ScriptDraft | null}): JSX.Element | null {
  if (!draft || draft.validation.status !== 'invalid') {
    return null;
  }

  return (
    <div className="validation-issue-list" data-testid="script-review-validation-issues">
      {draft.validation.errors.map((issue, index) => (
        <div className="validation-issue" key={`${issue.code}-${issue.path ?? index}`}>
          <strong>{issue.message}</strong>
          {issue.path ? <span>{issue.path}</span> : null}
        </div>
      ))}
    </div>
  );
}

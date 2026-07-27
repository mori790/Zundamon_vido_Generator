import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CodexPanel} from './CodexPanel';
import {ProductionCommandPanel, type ProductionCommandPanelHandle} from './ProductionCommandPanel';
import {PreviewPanel} from './PreviewPanel';
import {PreviewCoordinator} from './preview-coordinator';
import {previewClient} from './preview-client';
import {ScriptReviewPanel} from './ScriptReviewPanel';
import type {AssetFileAccess} from './asset-file-access';
import {loadChatHistory, saveChatHistory} from './chat-history-store';
import {listVideoProjects, loadWorkspace} from './workspace-client';
import type {ChatHistory} from '../shared/chat';
import type {Operation} from '../shared/command';
import {transitionProposal, type JsonDraftProposal, type Proposal} from '../shared/proposal';
import type {VideoProjectSummary, WorkspaceError, WorkspaceState} from '../shared/workspace';
import type {ProjectRootState, WorkspaceRootApi} from '../shared/workspace';
import type {DependencyApi, DependencyReport} from '../shared/desktop';

type Screen = 'start' | 'workspace';

declare global {
  var workspaceApi: WorkspaceRootApi | undefined;
  var dependencyApi: DependencyApi | undefined;
}

export function StudioApp({assetFileAccess}: {assetFileAccess?: AssetFileAccess} = {}): JSX.Element {
  const workspaceApi = globalThis.workspaceApi;
  const [rootState, setRootState] = useState<ProjectRootState>(
    workspaceApi ? {status: 'unconfigured'} : {status: 'ready', root: 'development'},
  );
  const [checkingRoot, setCheckingRoot] = useState(Boolean(workspaceApi));
  const [dependencies, setDependencies] = useState<DependencyReport | null>(null);

  useEffect(() => {
    if (!workspaceApi) return;
    let active = true;
    workspaceApi.get().then((state) => {
      if (active) setRootState(state);
    }).finally(() => {
      if (active) setCheckingRoot(false);
    });
    return () => {
      active = false;
    };
  }, [workspaceApi]);

  useEffect(() => {
    if (rootState.status !== 'ready' || !globalThis.dependencyApi) return;
    let active = true;
    globalThis.dependencyApi.checkAll().then((report) => {
      if (active) setDependencies(report);
    });
    return () => {
      active = false;
    };
  }, [rootState.status]);

  if (checkingRoot) {
    return <main className="studio-shell" aria-live="polite">Workspaceを確認しています...</main>;
  }

  if (rootState.status !== 'ready' && workspaceApi) {
    return <FirstRunGate api={workspaceApi} state={rootState} onChange={setRootState} />;
  }

  return (
    <>
      {dependencies ? <DependencyStatusPanel report={dependencies} /> : null}
      <StudioContent assetFileAccess={assetFileAccess} />
    </>
  );
}

function FirstRunGate({
  api,
  state,
  onChange,
}: {
  api: WorkspaceRootApi;
  state: ProjectRootState;
  onChange(state: ProjectRootState): void;
}): JSX.Element {
  const [busy, setBusy] = useState(false);
  return (
    <main className="studio-shell">
      <section className="start-panel" aria-labelledby="first-run-title" aria-live="polite">
        <h1 id="first-run-title" tabIndex={-1}>最初にWorkspaceを選択してください</h1>
        <p>台本、素材、生成データ、動画の保存先として使用するfolderを選びます。</p>
        {state.reason ? <p className="error-banner">{state.reason}</p> : null}
        <button
          data-testid="first-run-select-workspace-button"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            api.select().then(onChange).finally(() => setBusy(false));
          }}
          type="button"
        >
          {busy ? '確認中...' : 'Workspaceを選択'}
        </button>
      </section>
    </main>
  );
}

function DependencyStatusPanel({report}: {report: DependencyReport}): JSX.Element {
  const label = (status: DependencyReport['codex']) =>
    status.status === 'ready' ? `利用可能${status.detectedVersion ? ` (${status.detectedVersion})` : ''}` :
      status.actionCode === 'codex-install' ? '未導入: Codex CLIをインストールしてください。' :
      status.actionCode === 'codex-login' ? '未ログイン: codex loginを実行してください。' :
      status.actionCode === 'voicevox-start' ? '未起動: VOICEVOXを起動してください。' :
      '利用できません。再診断してください。';
  return (
    <aside className="dependency-status-panel" data-testid="dependency-status-panel" aria-live="polite">
      <span>Codex: {label(report.codex)}</span>
      <span>VOICEVOX: {label(report.voicevox)}</span>
    </aside>
  );
}

function StudioContent({assetFileAccess}: {assetFileAccess?: AssetFileAccess} = {}): JSX.Element {
  const [screen, setScreen] = useState<Screen>('start');
  const [projects, setProjects] = useState<VideoProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null);
  const [error, setError] = useState<WorkspaceError | null>(null);

  useEffect(() => {
    let active = true;
    listVideoProjects()
      .then((result) => {
        if (active) {
          setProjects(result);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingProjects(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function openWorkspace(videoId: string) {
    const result = await loadWorkspace(videoId);
    if (result.status === 'failed') {
      setError(result.error);
      setScreen('start');
      return;
    }

    setWorkspace(result.workspace);
    setError(null);
    setScreen('workspace');
  }

  if (screen === 'workspace' && workspace) {
    return (
      <WorkspaceShell
        assetFileAccess={assetFileAccess}
        workspace={workspace}
        onApplyScript={(activeScript) => {
          setWorkspace({
            ...workspace,
            mode: 'existing-script',
            activeScript,
          });
        }}
        onBack={() => {
          setWorkspace(null);
          setScreen('start');
        }}
      />
    );
  }

  return (
    <StartScreen
      projects={projects}
      loadingProjects={loadingProjects}
      error={error}
      onOpenWorkspace={openWorkspace}
    />
  );
}

type StartScreenProps = {
  projects: VideoProjectSummary[];
  loadingProjects: boolean;
  error: WorkspaceError | null;
  onOpenWorkspace(videoId: string): void;
};

function StartScreen({projects, loadingProjects, error, onOpenWorkspace}: StartScreenProps): JSX.Element {
  return (
    <main className="studio-shell">
      <section className="start-panel">
        <header className="start-header">
          <div>
            <h1>Zundamon Studio</h1>
            <p>動画IDを選択または入力して制作ワークスペースを開きます。</p>
          </div>
        </header>
        {error ? <WorkspaceOpenError error={error} /> : null}
        <div className="start-grid">
          <ProjectList projects={projects} loading={loadingProjects} onOpenWorkspace={onOpenWorkspace} />
          <NewProjectForm onOpenWorkspace={onOpenWorkspace} />
        </div>
      </section>
    </main>
  );
}

type ProjectListProps = {
  projects: VideoProjectSummary[];
  loading: boolean;
  onOpenWorkspace(videoId: string): void;
};

function ProjectList({projects, loading, onOpenWorkspace}: ProjectListProps): JSX.Element {
  return (
    <section className="workspace-card">
      <h2>既存の動画</h2>
      {loading ? <p className="muted">読み込み中...</p> : null}
      {!loading && projects.length === 0 ? <p className="muted">`input/` に台本JSONがありません。</p> : null}
      <div className="project-list" data-testid="start-screen-project-list">
        {projects.map((project) => (
          <button
            className="project-row"
            data-testid={`project-list-item-${project.videoId}`}
            key={project.videoId}
            onClick={() => onOpenWorkspace(project.videoId)}
            type="button"
          >
            <span>{project.videoId}</span>
            <small>{project.fileName}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function NewProjectForm({onOpenWorkspace}: {onOpenWorkspace(videoId: string): void}): JSX.Element {
  const [videoId, setVideoId] = useState('');

  return (
    <form
      className="workspace-card"
      onSubmit={(event) => {
        event.preventDefault();
        onOpenWorkspace(videoId);
      }}
    >
      <h2>新規動画ID</h2>
      <label className="field-label" htmlFor="new-video-id">
        videoId
      </label>
      <input
        data-testid="start-screen-new-video-id-input"
        id="new-video-id"
        onChange={(event) => setVideoId(event.target.value)}
        placeholder="my-video"
        value={videoId}
      />
      <button data-testid="start-screen-open-button" type="submit">
        開く
      </button>
    </form>
  );
}

function WorkspaceOpenError({error}: {error: WorkspaceError}): JSX.Element {
  return (
    <div className="error-banner" data-testid="workspace-open-error">
      <strong>{error.message}</strong>
      {error.targetPath ? <span>対象: {error.targetPath}</span> : null}
    </div>
  );
}

function WorkspaceShell({
  assetFileAccess,
  workspace,
  onApplyScript,
  onBack,
}: {
  assetFileAccess?: AssetFileAccess;
  workspace: WorkspaceState;
  onApplyScript(activeScript: NonNullable<WorkspaceState['activeScript']>): void;
  onBack(): void;
}): JSX.Element {
  const [history, setHistory] = useState<ChatHistory>({messages: [], proposals: []});
  const [busyProposalIds, setBusyProposalIds] = useState<Set<string>>(new Set());
  const [selectedProposal, setSelectedProposal] = useState<JsonDraftProposal | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const historyRef = useRef(history);
  const busyProposalIdsRef = useRef(new Set<string>());
  const commandPanelRef = useRef<ProductionCommandPanelHandle>(null);
  const commandProposalIdsRef = useRef(new Map<string, string>());
  const previewCoordinator = useMemo(
    () => new PreviewCoordinator(
      workspace.videoId,
      previewClient,
      (command) => commandPanelRef.current!.run(command),
    ),
    [workspace.videoId],
  );

  useEffect(() => () => previewCoordinator.dispose(), [previewCoordinator]);

  useEffect(() => {
    let active = true;
    loadChatHistory(workspace.videoId).then((loaded) => {
      if (active) {
        historyRef.current = loaded;
        setHistory(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, [workspace.videoId]);

  async function persistHistory(next: ChatHistory) {
    await saveChatHistory(workspace.videoId, next);
    historyRef.current = next;
    setHistory(next);
  }

  async function changeMessages(next: ChatHistory) {
    historyRef.current = next;
    setHistory(next);
    await saveChatHistory(workspace.videoId, next);
  }

  async function saveProposalTransition(current: Proposal, next: Proposal): Promise<boolean> {
    if (current === next || busyProposalIdsRef.current.has(current.id)) {
      return false;
    }
    busyProposalIdsRef.current.add(current.id);
    setBusyProposalIds((ids) => new Set(ids).add(current.id));
    setProposalError(null);
    try {
      const latest = historyRef.current;
      const nextHistory = {
        ...latest,
        proposals: latest.proposals.map((proposal) => proposal.id === current.id ? next : proposal),
      };
      await persistHistory(nextHistory);
      return true;
    } catch (caught) {
      setProposalError(caught instanceof Error ? caught.message : '提案状態の保存に失敗しました。');
      return false;
    } finally {
      busyProposalIdsRef.current.delete(current.id);
      setBusyProposalIds((ids) => {
        const nextIds = new Set(ids);
        nextIds.delete(current.id);
        return nextIds;
      });
    }
  }

  async function rejectProposal(proposalId: string) {
    const proposal = historyRef.current.proposals.find((item) => item.id === proposalId);
    if (!proposal || proposal.status !== 'pending' || busyProposalIdsRef.current.has(proposalId)) {
      return;
    }
    await saveProposalTransition(proposal, transitionProposal(proposal, 'rejected'));
  }

  function approveProposal(proposalId: string) {
    const proposal = historyRef.current.proposals.find((item) => item.id === proposalId);
    if (!proposal || proposal.status !== 'pending' || busyProposalIdsRef.current.has(proposalId)) {
      return;
    }
    if (proposal.kind === 'json-draft') {
      setSelectedProposal(proposal);
      return;
    }
    void runCommandProposal(proposal);
  }

  async function acceptJsonProposal(proposal: JsonDraftProposal): Promise<boolean> {
    return saveProposalTransition(proposal, transitionProposal(proposal, 'approved'));
  }

  async function completeJsonProposal(proposalId: string) {
    const proposal = historyRef.current.proposals.find((item) => item.id === proposalId);
    if (proposal) {
      const approved = proposal.status === 'pending' ? transitionProposal(proposal, 'approved') : proposal;
      await saveProposalTransition(proposal, transitionProposal(approved, 'completed'));
    }
    setSelectedProposal(null);
  }

  async function runCommandProposal(proposal: Proposal) {
    const approved = transitionProposal(proposal, 'approved');
    if (!(await saveProposalTransition(proposal, approved))) {
      return;
    }
    try {
      if (approved.kind !== 'command') {
        return;
      }
      const operation = await commandPanelRef.current!.start(approved.operation);
      commandProposalIdsRef.current.set(operation.id, approved.id);
    } catch (caught) {
      await saveProposalTransition(
        approved,
        transitionProposal(approved, 'failed', {
          error: caught instanceof Error ? caught.message : String(caught),
        }),
      );
    }
  }

  const finishCommandProposal = useCallback((operation: Operation) => {
    if (operation.status === 'succeeded' && (operation.command === 'voice' || operation.command === 'timeline')) {
      void previewCoordinator.refresh();
    }
    const proposalId = commandProposalIdsRef.current.get(operation.id);
    if (!proposalId) {
      return;
    }
    commandProposalIdsRef.current.delete(operation.id);
    const proposal = historyRef.current.proposals.find((item) => item.id === proposalId);
    if (!proposal || proposal.status !== 'approved') {
      return;
    }
    const status = operation.status === 'succeeded' ? 'completed' : 'failed';
    void saveProposalTransition(
      proposal,
      transitionProposal(proposal, status, status === 'failed' ? {error: operation.error ?? 'コマンドが失敗しました。'} : {}),
    );
  }, [previewCoordinator]);

  async function retryProposal(proposalId: string) {
    const proposal = historyRef.current.proposals.find((item) => item.id === proposalId);
    if (!proposal || proposal.status !== 'failed') {
      return;
    }
    const {error: _error, ...retryBase} = proposal;
    const retry = {
      ...retryBase,
      id: `${proposal.id}-retry-${Date.now()}`,
      status: 'pending' as const,
      updatedAt: new Date().toISOString(),
    };
    try {
      const latest = historyRef.current;
      await persistHistory({...latest, proposals: [...latest.proposals, retry]});
    } catch (caught) {
      setProposalError(caught instanceof Error ? caught.message : '提案状態の保存に失敗しました。');
    }
  }

  return (
    <main className="studio-shell">
      <section className="workspace-panel">
        <WorkspaceHeader workspace={workspace} onBack={onBack} />
        <div className="workspace-body">
          <div className="workspace-main">
            <ScriptReviewPanel
              activeScript={workspace.activeScript}
              assetFileAccess={assetFileAccess}
              onAcceptProposal={acceptJsonProposal}
              onApply={(script) => {
                onApplyScript(script);
                void previewCoordinator.refresh();
              }}
              onDismissProposal={() => setSelectedProposal(null)}
              onProposalLoaded={completeJsonProposal}
              proposal={selectedProposal}
              videoId={workspace.videoId}
            />
            <PreviewPanel
              coordinator={previewCoordinator}
              runFallback={(command) => void commandPanelRef.current?.start(command)}
            />
            <ProductionCommandPanel
              onOperationFinished={finishCommandProposal}
              ref={commandPanelRef}
              videoId={workspace.videoId}
            />
          </div>
          <CodexPanel
            busyProposalIds={busyProposalIds}
            history={history}
            onApproveProposal={approveProposal}
            onHistoryChange={changeMessages}
            onRejectProposal={(proposalId) => void rejectProposal(proposalId)}
            onRetryProposal={(proposalId) => void retryProposal(proposalId)}
            proposalError={proposalError}
            title={workspace.activeScript?.title}
            videoId={workspace.videoId}
            workspaceMode={workspace.mode}
          />
        </div>
      </section>
    </main>
  );
}

function WorkspaceHeader({workspace, onBack}: {workspace: WorkspaceState; onBack(): void}): JSX.Element {
  return (
    <header className="workspace-header">
      <button data-testid="workspace-back-button" onClick={onBack} type="button">
        戻る
      </button>
      <div>
        <h1 data-testid="workspace-header-video-id">{workspace.videoId}</h1>
        <p data-testid="workspace-header-mode">
          {workspace.mode === 'existing-script' ? '既存台本' : '空の下書き'}
        </p>
      </div>
    </header>
  );
}

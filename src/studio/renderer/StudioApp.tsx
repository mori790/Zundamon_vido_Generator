import {useEffect, useState} from 'react';
import {CodexPanel} from './CodexPanel';
import {ScriptReviewPanel} from './ScriptReviewPanel';
import {listVideoProjects, loadWorkspace} from './workspace-client';
import type {VideoProjectSummary, WorkspaceError, WorkspaceState} from '../shared/workspace';

type Screen = 'start' | 'workspace';

export function StudioApp(): JSX.Element {
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
  workspace,
  onApplyScript,
  onBack,
}: {
  workspace: WorkspaceState;
  onApplyScript(activeScript: NonNullable<WorkspaceState['activeScript']>): void;
  onBack(): void;
}): JSX.Element {
  return (
    <main className="studio-shell">
      <section className="workspace-panel">
        <WorkspaceHeader workspace={workspace} onBack={onBack} />
        <div className="workspace-body">
          <ScriptReviewPanel
            activeScript={workspace.activeScript}
            onApply={onApplyScript}
            videoId={workspace.videoId}
          />
          <CodexPanel
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

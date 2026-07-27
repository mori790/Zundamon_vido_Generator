import {useState} from 'react';
import type {LocalFileApi} from '../shared/local-file';
import type {SceneWithAsset} from '../shared/scene-segmentation';
import {buildVideoScript} from '../shared/script-builder';

declare global {
  var localFileApi: LocalFileApi | undefined;
}

type Props = {
  scenes: SceneWithAsset[];
  videoId: string;
  onSuccess(videoId: string): void;
};

export function JsonGenerateTab({scenes, videoId, onSuccess}: Props): JSX.Element {
  const [title, setTitle] = useState(videoId);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setSaved(false);
    try {
      const script = buildVideoScript(scenes, videoId, title);
      const json = JSON.stringify(script, null, 2);
      await globalThis.localFileApi?.workspace.writeScript(`${videoId}.json`, json);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'JSONの保存に失敗しました。再試行してください。');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="json-generate-tab" data-testid="json-generate-tab">
      <h2>JSON生成</h2>
      <p className="muted">{scenes.length}件のシーン</p>
      <div className="field-group">
        <label htmlFor="video-title">動画タイトル</label>
        <input
          id="video-title"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
      </div>
      {error ? <p className="error-banner">{error}</p> : null}
      {saved ? (
        <div data-testid="json-generate-success">
          <p>input/{videoId}.json を保存しました。</p>
          <button onClick={() => onSuccess(videoId)} type="button">
            ワークスペースを開く
          </button>
        </div>
      ) : (
        <button disabled={generating} onClick={() => void handleGenerate()} type="button">
          {generating ? '生成中...' : 'JSONを生成して保存'}
        </button>
      )}
    </section>
  );
}

import type {SceneWithAsset} from '../shared/scene-segmentation';

type Props = {
  scene: SceneWithAsset;
  index: number;
  isLoading: boolean;
  disabled: boolean;
  error: string | null;
  onAssign(): void;
  onClear(): void;
};

export function SceneAssetCard({scene, index, isLoading, disabled, error, onAssign, onClear}: Props): JSX.Element {
  const narrationPreview = scene.narration.slice(0, 60) + (scene.narration.length > 60 ? '…' : '');

  return (
    <article className="scene-asset-card" data-testid={`scene-asset-card-${index}`}>
      <header>
        <span className="scene-id">{scene.id}</span>
        <span className="scene-title">{scene.title || '（タイトルなし）'}</span>
      </header>
      <p className="scene-narration-preview">{narrationPreview}</p>
      <div className="asset-assignment">
        {scene.assetPublicPath ? (
          <>
            <span className="asset-file-name">{scene.assetFileName}</span>
            <button onClick={onClear} type="button">
              クリア
            </button>
          </>
        ) : (
          <span className="muted">未割り当て</span>
        )}
        <button disabled={disabled} onClick={onAssign} type="button">
          {isLoading ? '選択中...' : '素材を選択'}
        </button>
      </div>
      {error ? <p className="error-banner">{error}</p> : null}
    </article>
  );
}

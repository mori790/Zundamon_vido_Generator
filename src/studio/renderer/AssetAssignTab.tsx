import {useState} from 'react';
import type {LocalFileApi} from '../shared/local-file';
import type {Scene, SceneWithAsset} from '../shared/scene-segmentation';
import {SceneAssetCard} from './SceneAssetCard';

declare global {
  var localFileApi: LocalFileApi | undefined;
}

type Props = {
  initialScenes: Scene[];
  videoId: string | null;
  onConfirm(scenes: SceneWithAsset[]): void;
};

export function AssetAssignTab({initialScenes, videoId, onConfirm}: Props): JSX.Element {
  const [scenes, setScenes] = useState<SceneWithAsset[]>(() =>
    initialScenes.map((s) => ({...s, assetPublicPath: null, assetFileName: null})),
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  async function handleAssign(index: number) {
    if (loadingIndex !== null) return;
    setErrors((prev) => {
      const next = {...prev};
      delete next[index];
      return next;
    });
    setLoadingIndex(index);
    try {
      const selection = await globalThis.localFileApi?.asset.select() ?? null;
      if (!selection) return;

      const result = await globalThis.localFileApi?.asset.copy(videoId!, selection.token, true);
      if (!result || result.status === 'failed') {
        setErrors((prev) => ({...prev, [index]: result?.message ?? '素材のコピーに失敗しました。'}));
        return;
      }
      setScenes((prev) =>
        prev.map((s, i) =>
          i === index
            ? {...s, assetPublicPath: result.publicPath, assetFileName: selection.fileName}
            : s,
        ),
      );
    } finally {
      setLoadingIndex(null);
    }
  }

  function handleClear(index: number) {
    setScenes((prev) =>
      prev.map((s, i) => (i === index ? {...s, assetPublicPath: null, assetFileName: null} : s)),
    );
    setErrors((prev) => {
      const next = {...prev};
      delete next[index];
      return next;
    });
  }

  const assigned = scenes.filter((s) => s.assetPublicPath !== null).length;

  return (
    <section className="asset-assign-tab" data-testid="asset-assign-tab">
      <h2>素材割り当て</h2>
      <p className="muted">
        {assigned}件 / {scenes.length}件 割り当て済み
      </p>
      <div className="scene-asset-list">
        {scenes.map((scene, index) => (
          <SceneAssetCard
            key={scene.id}
            disabled={loadingIndex !== null || !videoId}
            error={errors[index] ?? null}
            index={index}
            isLoading={loadingIndex === index}
            onAssign={() => void handleAssign(index)}
            onClear={() => handleClear(index)}
            scene={scene}
          />
        ))}
      </div>
      <div style={{marginTop: '16px'}}>
        <button onClick={() => onConfirm(scenes)} type="button">
          次へ（JSON生成）
        </button>
      </div>
    </section>
  );
}

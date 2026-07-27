import type {TextInputStatus} from '../shared/text-input-draft';

type Props = {
  text: string;
  workspaceSelected: boolean;
  status: TextInputStatus;
  onStart(): void;
};

const ACTIVE_STATUSES = new Set<TextInputStatus>(['idle', 'has-text', 'segmentation-error']);

export function SegmentationButton({text, workspaceSelected, status, onStart}: Props): JSX.Element {
  const segmenting = status === 'segmenting';
  const enabled = text.trim().length > 0 && workspaceSelected && ACTIVE_STATUSES.has(status);

  return (
    <button
      data-testid="segmentation-button"
      disabled={!enabled}
      onClick={onStart}
      type="button"
    >
      {segmenting ? '分割中...' : 'シーンに分割する'}
    </button>
  );
}

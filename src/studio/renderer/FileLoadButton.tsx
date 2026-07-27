import {checkFileExtension, checkFileSize, MAX_DRAFT_FILE_BYTES} from '../shared/text-input-draft';
import type {TextInputFileApi} from '../shared/local-file';

declare global {
  var textInputFileApi: TextInputFileApi | undefined;
}

type Props = {
  onLoad(text: string): void;
  disabled: boolean;
  existingText: string;
};

export function FileLoadButton({onLoad, disabled, existingText}: Props): JSX.Element {
  async function handleClick() {
    const api = globalThis.textInputFileApi;
    if (!api) return;

    const selected = await api.openFileDialog();
    if (!selected) return;

    if (!checkFileExtension(selected.fileName)) {
      window.alert('.txt または .md ファイルを選択してください。');
      return;
    }

    if (existingText.trim().length > 0) {
      const confirmed = window.confirm('現在のテキストを選択したファイルの内容で上書きしますか？');
      if (!confirmed) return;
    }

    let result: {content: string; byteSize: number};
    try {
      result = await api.readTextFile(selected.filePath);
    } catch {
      window.alert('ファイルを読み込めませんでした。');
      return;
    }

    if (!checkFileSize(result.byteSize)) {
      window.alert(`ファイルが大きすぎます（${Math.ceil(MAX_DRAFT_FILE_BYTES / 1024)}KB以下にしてください）。`);
      return;
    }

    onLoad(result.content);
  }

  return (
    <button
      data-testid="file-load-button"
      disabled={disabled}
      onClick={() => { void handleClick(); }}
      type="button"
    >
      ファイルを読み込む
    </button>
  );
}

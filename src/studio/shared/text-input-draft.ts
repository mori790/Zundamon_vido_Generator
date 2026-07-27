export const MAX_DRAFT_FILE_BYTES = 1_048_576;

export type TextInputStatus = 'idle' | 'has-text' | 'segmenting' | 'segmentation-error';

export interface TextInputDraft {
  draftText: string;
  savedAt: string;
}

export interface TextInputState {
  draftText: string;
  status: TextInputStatus;
  errorMessage: string | null;
}

export type TextInputValidationResult =
  | {ok: true}
  | {ok: false; reason: 'empty-text' | 'no-workspace'; message: string};

export type FileLoadResult =
  | {ok: true; text: string; fileName: string}
  | {ok: false; reason: 'unsupported-format' | 'file-too-large' | 'read-error'; message: string};

export function validateTextInput({
  draftText,
  workspaceRoot,
}: {
  draftText: string;
  workspaceRoot: string | null;
}): TextInputValidationResult {
  if (!draftText.trim()) {
    return {ok: false, reason: 'empty-text', message: 'テキストを入力してください。'};
  }
  if (!workspaceRoot) {
    return {ok: false, reason: 'no-workspace', message: 'Workspaceを選択してからシーンに分割してください。'};
  }
  return {ok: true};
}

export function checkFileExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith('.txt') || lower.endsWith('.md');
}

export function checkFileSize(byteSize: number): boolean {
  return byteSize <= MAX_DRAFT_FILE_BYTES;
}

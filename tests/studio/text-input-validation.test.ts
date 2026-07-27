import {describe, expect, it} from 'vitest';
import {
  checkFileExtension,
  checkFileSize,
  MAX_DRAFT_FILE_BYTES,
  validateTextInput,
} from '../../src/studio/shared/text-input-draft';

describe('validateTextInput', () => {
  it('returns ok when text and workspace are present', () => {
    const result = validateTextInput({draftText: 'hello', workspaceRoot: '/workspace'});
    expect(result.ok).toBe(true);
  });

  it('returns empty-text when draftText is blank', () => {
    const result = validateTextInput({draftText: '   ', workspaceRoot: '/workspace'});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('empty-text');
  });

  it('returns empty-text when draftText is empty string', () => {
    const result = validateTextInput({draftText: '', workspaceRoot: '/workspace'});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('empty-text');
  });

  it('returns no-workspace when workspaceRoot is null', () => {
    const result = validateTextInput({draftText: 'hello', workspaceRoot: null});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no-workspace');
  });

  it('returns empty-text (not no-workspace) when both are missing', () => {
    const result = validateTextInput({draftText: '', workspaceRoot: null});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('empty-text');
  });
});

describe('checkFileExtension', () => {
  it('allows .txt files', () => {
    expect(checkFileExtension('draft.txt')).toBe(true);
  });

  it('allows .md files', () => {
    expect(checkFileExtension('README.md')).toBe(true);
  });

  it('allows uppercase extensions', () => {
    expect(checkFileExtension('DRAFT.TXT')).toBe(true);
    expect(checkFileExtension('README.MD')).toBe(true);
  });

  it('rejects .pdf files', () => {
    expect(checkFileExtension('document.pdf')).toBe(false);
  });

  it('rejects .docx files', () => {
    expect(checkFileExtension('document.docx')).toBe(false);
  });

  it('rejects files with no extension', () => {
    expect(checkFileExtension('plainfile')).toBe(false);
  });

  it('rejects files with .md in the middle but wrong extension', () => {
    expect(checkFileExtension('readme.md.bak')).toBe(false);
  });
});

describe('checkFileSize', () => {
  it('allows files at the limit (1MB)', () => {
    expect(checkFileSize(MAX_DRAFT_FILE_BYTES)).toBe(true);
  });

  it('allows files under the limit', () => {
    expect(checkFileSize(MAX_DRAFT_FILE_BYTES - 1)).toBe(true);
  });

  it('rejects files over the limit', () => {
    expect(checkFileSize(MAX_DRAFT_FILE_BYTES + 1)).toBe(false);
  });

  it('allows zero-byte files', () => {
    expect(checkFileSize(0)).toBe(true);
  });
});

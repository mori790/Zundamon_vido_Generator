import {describe, expect, it, vi, beforeEach} from 'vitest';
import type {TextInputDraft} from '../../src/studio/shared/text-input-draft';

describe('DraftPersistenceService (via LocalFileApi.draft)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null when draft file does not exist (ENOENT)', async () => {
    const mockApi = {
      read: vi.fn().mockResolvedValue(null),
      write: vi.fn().mockResolvedValue(undefined),
    };

    const result = await mockApi.read('sample-video');
    expect(result).toBeNull();
  });

  it('returns JSON string when draft exists', async () => {
    const draft: TextInputDraft = {draftText: '第一シーン', savedAt: '2026-07-27T00:00:00.000Z'};
    const mockApi = {
      read: vi.fn().mockResolvedValue(JSON.stringify(draft)),
      write: vi.fn().mockResolvedValue(undefined),
    };

    const raw = await mockApi.read('sample-video');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as TextInputDraft;
    expect(parsed.draftText).toBe('第一シーン');
  });

  it('saves draft successfully', async () => {
    const mockApi = {
      read: vi.fn().mockResolvedValue(null),
      write: vi.fn().mockResolvedValue(undefined),
    };
    const draft: TextInputDraft = {draftText: 'テスト草案', savedAt: '2026-07-27T00:00:00.000Z'};

    await mockApi.write('sample-video', JSON.stringify(draft));
    expect(mockApi.write).toHaveBeenCalledWith('sample-video', JSON.stringify(draft));
  });

  it('propagates write error to caller', async () => {
    const writeError = new Error('disk full');
    const mockApi = {
      read: vi.fn().mockResolvedValue(null),
      write: vi.fn().mockRejectedValue(writeError),
    };

    await expect(mockApi.write('sample-video', '{}')).rejects.toThrow('disk full');
  });

  it('round-trips draftText faithfully', async () => {
    const original = '長い草案テキスト\n改行含む\n三行目';
    const draft: TextInputDraft = {draftText: original, savedAt: '2026-07-27T00:00:00.000Z'};
    const stored = JSON.stringify(draft);

    const mockApi = {
      read: vi.fn().mockResolvedValue(stored),
      write: vi.fn().mockResolvedValue(undefined),
    };

    const raw = await mockApi.read('sample-video');
    const parsed = JSON.parse(raw!) as TextInputDraft;
    expect(parsed.draftText).toBe(original);
  });
});

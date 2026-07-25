import {describe, expect, it} from 'vitest';
import {resolvePublicReference, validateVideoId} from '../src/core/path-resolver';
import {checkAssets} from '../src/core/asset-checker';
import {loadVideoScript} from '../src/core/script-loader';

describe('path safety', () => {
  it('rejects unsafe video IDs', () => {
    expect(() => validateVideoId('../bad')).toThrow();
  });

  it('rejects traversal public references', () => {
    expect(() => resolvePublicReference('/../secret.txt')).toThrow();
  });
});

describe('checkAssets', () => {
  it('allows sample placeholder assets', async () => {
    const script = await loadVideoScript('sample-video');
    const result = await checkAssets(script);
    expect(result.errors).toEqual([]);
  });
});

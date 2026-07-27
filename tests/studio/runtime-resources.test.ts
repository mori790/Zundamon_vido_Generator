import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {resolveRuntimeResources} from '../../src/studio/main/runtime-resources';

describe('packaged runtime resources', () => {
  it('uses compiled app files without a development server or TypeScript entry', () => {
    const resources = resolveRuntimeResources(
      {isPackaged: true, getAppPath: () => '/Applications/App'},
      '/Applications/App/Contents/Resources',
    );
    expect(resources.rendererHtml).toBe(path.join('/Applications/App', 'dist-studio/studio.html'));
    expect(resources.preload).toBe(path.join('/Applications/App', 'dist-studio/preload.cjs'));
    expect(resources.preload.endsWith('.ts')).toBe(false);
    expect(resources.cliRoot).toBe('/Applications/App/Contents/Resources/dist-cli');
  });
});

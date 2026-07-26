import React from 'react';
import {createRoot} from 'react-dom/client';
import {StudioApp} from './StudioApp';
import {createRendererAssetFileAccess} from './asset-file-access';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const assetFileAccess = createAssetFileAccess();

createRoot(root).render(
  <React.StrictMode>
    <StudioApp assetFileAccess={assetFileAccess} />
  </React.StrictMode>,
);

function createAssetFileAccess() {
  const require = window.require;
  const process = require?.('node:process') as typeof import('node:process') | undefined;
  const assetArgument = process?.argv.find((argument) => argument.startsWith('--studio-e2e-asset='));
  const workspaceArgument = process?.argv.find((argument) =>
    argument.startsWith('--studio-e2e-workspace='),
  );
  const sourcePath = assetArgument?.slice('--studio-e2e-asset='.length);
  const workspaceRoot = workspaceArgument?.slice('--studio-e2e-workspace='.length);
  if (!require || !sourcePath) {
    return createRendererAssetFileAccess();
  }
  const fs = require('node:fs/promises') as typeof import('node:fs/promises');
  const path = require('node:path') as typeof import('node:path');
  return createRendererAssetFileAccess({
    workspaceRoot,
    async selectImage() {
      const bytes = await fs.readFile(sourcePath);
      const fileName = path.basename(sourcePath);
      return {
        file: new File([new Uint8Array(bytes)], fileName, {type: 'image/png'}),
        fileName,
        sourcePath,
      };
    },
  });
}

import React from 'react';
import {createRoot} from 'react-dom/client';
import {StudioApp} from './StudioApp';
import {createRendererAssetFileAccess} from './asset-file-access';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const assetFileAccess = createRendererAssetFileAccess();

createRoot(root).render(
  <React.StrictMode>
    <StudioApp assetFileAccess={assetFileAccess} />
  </React.StrictMode>,
);

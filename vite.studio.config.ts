import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist-studio',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'studio.html'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});

import path from 'node:path';
import {app, BrowserWindow} from 'electron';

const isDev = process.env.NODE_ENV !== 'production';

async function createMainWindow(): Promise<void> {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Zundamon Studio',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(process.cwd(), 'src/studio/main/preload.ts'),
    },
  });

  if (isDev) {
    await window.loadURL(process.env.STUDIO_DEV_SERVER_URL ?? 'http://localhost:5173/studio.html');
    return;
  }

  await window.loadFile(path.join(process.cwd(), 'dist-studio/studio.html'));
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createMainWindow();
  }
});

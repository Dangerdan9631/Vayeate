import { app, BrowserWindow } from 'electron';
import { mkdirSync, rmSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createMainWindow, getMainWindow } from './main-window';
import { registerIpcHandlers } from './ipc-handlers';
import { installMainLogForwarding } from './log-forwarding';
import { DATA_DIR, getUndoStacksDir } from './paths';

app.whenReady().then(async () => {
  await mkdir(join(DATA_DIR, 'catalogs'), { recursive: true });
  await mkdir(join(DATA_DIR, 'templates'), { recursive: true });
  await mkdir(join(DATA_DIR, 'themes'), { recursive: true });

  const undoStacksDir = getUndoStacksDir();
  // Product policy: discard persisted undo stacks on every app cold start so stacks never
  // survive across sessions. Renderer-owned undo state is rebuilt after load; this only
  // clears on-disk files under userData (see getUndoStacksDir).
  rmSync(undoStacksDir, { recursive: true, force: true });
  mkdirSync(undoStacksDir, { recursive: true });

  registerIpcHandlers(getMainWindow);
  createMainWindow();
  installMainLogForwarding(getMainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Single-window app: always terminate the process when the window is gone (including macOS;
// the default darwin exception would leave Electron running with no UI after the red close button).
app.on('window-all-closed', () => {
  app.quit();
});

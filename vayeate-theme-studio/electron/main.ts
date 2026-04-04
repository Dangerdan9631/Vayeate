import { app, BrowserWindow, desktopCapturer, ipcMain, net, screen } from 'electron';
import { rmSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, unlink, readdir, stat } from 'node:fs/promises';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Theme Studio package root (contains data/, electron/). */
const PROJECT_ROOT = resolve(join(__dirname, '..'));

/** Repository-relative data directory: vayeate-theme-studio/data */
const DATA_DIR = join(__dirname, '..', 'data');

function resolveSafeProjectRelativePath(rel: string, kind: 'file' | 'dir'): string {
  const trimmed = rel.replace(/\\/g, '/').trim();
  if (!trimmed) {
    throw new Error('Invalid path');
  }
  if (trimmed.startsWith('/') || /^[a-zA-Z]:/.test(trimmed)) {
    throw new Error('Path must be relative');
  }
  let pathPart = trimmed;
  if (kind === 'file') {
    if (pathPart.endsWith('/') || pathPart.endsWith('\\')) {
      throw new Error('Invalid file path');
    }
  } else {
    pathPart = pathPart.replace(/[/\\]+$/, '');
  }
  const segments = pathPart.split('/').filter((s) => s && s !== '.');
  for (const s of segments) {
    if (s === '..') {
      throw new Error('Invalid path segment');
    }
  }
  const rootResolved = resolve(PROJECT_ROOT);
  let abs = rootResolved;
  for (const s of segments) {
    abs = join(abs, s);
  }
  const resolved = resolve(abs);
  const prefix = rootResolved.endsWith(sep) ? rootResolved : rootResolved + sep;
  if (resolved !== rootResolved && !resolved.toLowerCase().startsWith(prefix.toLowerCase())) {
    throw new Error('Path escapes project root');
  }
  return resolved;
}

/** Repo-root `themes/` (extension output); used when renderer saves `exthemes/...` via FileSystemService. */
function resolveExthemesExportFile(rel: string): string {
  const prefix = 'exthemes/';
  if (!rel.startsWith(prefix)) {
    throw new Error('Invalid exthemes path');
  }
  const rest = rel.slice(prefix.length);
  const segments = rest.split(/[/\\]/).filter((s) => s && s !== '.');
  for (const s of segments) {
    if (s === '..') {
      throw new Error('Invalid path segment');
    }
  }
  const themesDir = join(PROJECT_ROOT, '..', 'themes');
  return join(themesDir, ...segments);
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Serialize log args for IPC so main process logs appear in renderer DevTools console. No-op if window is closed/destroyed. */
function forwardMainLog(level: LogLevel, ...args: unknown[]): void {
  const win = mainWindow;
  if (win == null) return;
  try {
    if (win.webContents.isDestroyed()) return;
    const serialized = args.map((a) =>
      a instanceof Error ? a.message : (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a)),
    );
    win.webContents.send('main-log', level, serialized);
  } catch {
    // Window can be destroyed during close; ignore "Object has been destroyed" and similar
  }
}

/** Wrap console so main process logs also go to the renderer (DevTools) and use console.log for debug so the IDE console shows all levels. */
function installMainLogForwarding(): void {
  const orig = {
    debug: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  console.debug = (...args: unknown[]) => {
    orig.debug(...args);
    forwardMainLog('debug', ...args);
  };
  console.info = (...args: unknown[]) => {
    orig.info(...args);
    forwardMainLog('info', ...args);
  };
  console.warn = (...args: unknown[]) => {
    orig.warn(...args);
    forwardMainLog('warn', ...args);
  };
  console.error = (...args: unknown[]) => {
    orig.error(...args);
    forwardMainLog('error', ...args);
  };
}

/** App icon path (repo root images/icon.png) for window and dock/taskbar. */
const APP_ICON_PATH = join(__dirname, '..', '..', 'images', 'icon.png');

/** Undo stacks persisted under data/.undo; cleared on every app start. */
function getUndoStacksDir(): string {
  return join(DATA_DIR, '.undo');
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    frame: false,
    icon: APP_ICON_PATH,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.show();

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('minimize', () => {
    mainWindow?.webContents.send('window:minimized');
  });
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:maximized');
  });
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:unmaximized');
  });
  mainWindow.on('restore', () => {
    mainWindow?.webContents.send('window:restored');
  });
  mainWindow.on('resize', () => {
    if (mainWindow == null || mainWindow.webContents.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    mainWindow.webContents.send('window:resized', bounds.width, bounds.height);
  });
  mainWindow.on('move', () => {
    if (mainWindow == null || mainWindow.webContents.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    mainWindow.webContents.send('window:moved', bounds.x, bounds.y);
  });
}

app.whenReady().then(async () => {
  await mkdir(join(DATA_DIR, 'catalogs'), { recursive: true });
  await mkdir(join(DATA_DIR, 'templates'), { recursive: true });
  await mkdir(join(DATA_DIR, 'themes'), { recursive: true });

  const undoStacksDir = getUndoStacksDir();
  rmSync(undoStacksDir, { recursive: true, force: true });
  mkdirSync(undoStacksDir, { recursive: true });

  ipcMain.handle('fs:createFile', async (_event, rel: string) => {
    const abs = resolveSafeProjectRelativePath(rel, 'file');
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, '', { encoding: 'utf-8', flag: 'wx' });
  });

  ipcMain.handle('fs:saveFile', async (_event, rel: string, contents: string) => {
    const abs = rel.startsWith('exthemes/')
      ? resolveExthemesExportFile(rel)
      : resolveSafeProjectRelativePath(rel, 'file');
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, contents, { encoding: 'utf-8' });
  });

  ipcMain.handle('fs:loadFile', async (_event, rel: string): Promise<string | null> => {
    const abs = resolveSafeProjectRelativePath(rel, 'file');
    try {
      return await readFile(abs, 'utf-8');
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw e;
    }
  });

  ipcMain.handle('fs:deleteFile', async (_event, rel: string) => {
    const abs = resolveSafeProjectRelativePath(rel, 'file');
    await unlink(abs);
  });

  ipcMain.handle('fs:listFiles', async (_event, rel: string): Promise<string[]> => {
    const abs = resolveSafeProjectRelativePath(rel, 'dir');
    const st = await stat(abs);
    if (!st.isDirectory()) {
      throw new Error('Not a directory');
    }
    const entries = await readdir(abs, { withFileTypes: true });
    return entries.filter((d) => d.isFile()).map((d) => d.name);
  });

  ipcMain.handle(
    'fs:listDirEntries',
    async (_event, rel: string): Promise<Array<{ name: string; isDirectory: boolean }>> => {
      const abs = resolveSafeProjectRelativePath(rel, 'dir');
      const st = await stat(abs);
      if (!st.isDirectory()) {
        throw new Error('Not a directory');
      }
      const entries = await readdir(abs, { withFileTypes: true });
      return entries.map((e) => ({ name: e.name, isDirectory: e.isDirectory() }));
    },
  );

  /** Full virtual desktop: layout + per-display PNG bytes (ScreenshotService). */
  ipcMain.handle('screenshot:getFullDisplaySnapshot', async () => {
    const displays = screen.getAllDisplays();
    /** Very large thumbnail requests can stall or fail on some GPUs; cap for reliability. */
    const MAX_CAPTURE_DIM = 4096;
    const rawW = displays.length === 0 ? 1920 : Math.max(...displays.map((d) => d.bounds.width));
    const rawH = displays.length === 0 ? 1080 : Math.max(...displays.map((d) => d.bounds.height));
    const maxW = Math.min(rawW, MAX_CAPTURE_DIM);
    const maxH = Math.min(rawH, MAX_CAPTURE_DIM);

    const capSources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: maxW, height: maxH },
    });

    const byDisplayId = new Map<string, (typeof displays)[0]>();
    for (const d of displays) byDisplayId.set(String(d.id), d);
    const usedDisplayIndex = new Set<number>();

    const displayRows: Array<{
      sourceId: string;
      x: number;
      y: number;
      width: number;
      height: number;
      png: Buffer;
    }> = [];

    for (const src of capSources) {
      let bounds: { x: number; y: number; width: number; height: number } | undefined;
      if (src.display_id != null) {
        const display = byDisplayId.get(String(src.display_id));
        if (display?.bounds) bounds = display.bounds;
      }
      if (bounds == null) {
        const idx = displays.findIndex((_, i) => !usedDisplayIndex.has(i));
        if (idx >= 0) {
          usedDisplayIndex.add(idx);
          bounds = displays[idx].bounds;
        } else {
          bounds = { x: 0, y: 0, width: 1920, height: 1080 };
        }
      } else if (src.display_id != null) {
        const display = byDisplayId.get(String(src.display_id));
        if (display) usedDisplayIndex.add(displays.indexOf(display));
      }

      const png = src.thumbnail.toPNG();
      if (png.length === 0) {
        throw new Error('Screenshot capture failed: empty PNG for desktop source');
      }

      displayRows.push({
        sourceId: src.id,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        png,
      });
    }

    if (displayRows.length === 0) {
      return {
        fullBounds: { x: 0, y: 0, width: 0, height: 0 },
        displays: [],
      };
    }

    const minX = Math.min(...displayRows.map((r) => r.x));
    const minY = Math.min(...displayRows.map((r) => r.y));
    const maxX = Math.max(...displayRows.map((r) => r.x + r.width));
    const maxY = Math.max(...displayRows.map((r) => r.y + r.height));

    return {
      fullBounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      displays: displayRows,
    };
  });

  const configPath = join(DATA_DIR, 'config.json');
  ipcMain.on('config:loadSync', (event) => {
    try {
      event.returnValue = existsSync(configPath)
        ? JSON.parse(readFileSync(configPath, 'utf-8'))
        : null;
    } catch {
      event.returnValue = null;
    }
  });

  ipcMain.handle('net:fetch', async (_event, url: string) => {
    const response = await net.fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return text;
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    mainWindow?.maximize();
  });

  ipcMain.handle('window:restore', () => {
    mainWindow?.unmaximize();
  });

  ipcMain.handle('window:drag', () => {
    // No-op; actual dragging typically uses -webkit-app-region: drag in CSS.
  });

  ipcMain.handle('window:reload', () => {
    mainWindow?.reload();
  });

  ipcMain.handle('window:reloadForce', async () => {
    if (mainWindow) {
      await mainWindow.webContents.session.clearCache();
      mainWindow.reload();
    }
  });

  ipcMain.handle('window:toggleDevTools', () => {
    mainWindow?.webContents.toggleDevTools();
  });

  ipcMain.handle('window:getBounds', () => {
    if (mainWindow == null || mainWindow.isDestroyed()) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return mainWindow.getBounds();
  });

  createWindow();
  installMainLogForwarding();

  ipcMain.on('renderer-log', (_event, level: LogLevel, tag: string, args: string[]) => {
    const prefix = `[${tag}]`;
    switch (level) {
      case 'debug':
      case 'info':
        console.log(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Single-window app: always terminate the process when the window is gone (including macOS;
// the default darwin exception would leave Electron running with no UI after the red close button).
app.on('window-all-closed', () => {
  app.quit();
});

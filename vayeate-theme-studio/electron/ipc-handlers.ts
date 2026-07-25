import type { BrowserWindow } from 'electron';
import { desktopCapturer, ipcMain, net, screen } from 'electron';
import { watch, type FSWatcher } from 'node:fs';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import {
  resolveExthemesExportFile,
  resolveSafeProjectRelativePath,
} from './paths';
import { openThemePreviewHost, type ThemePreviewHostRequest } from './theme-preview-host';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type BoundsDto = { x: number; y: number; width: number; height: number };

interface AppFileWrite {
  contents: string;
  revision: number;
}

const appFileWrites = new Map<string, AppFileWrite>();
let nextAppFileWriteRevision = 0;

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  const fileWatchers = new Map<string, {
    watcher: FSWatcher;
    timeout: NodeJS.Timeout | null;
    removeDestroyedListener: () => void;
  }>();

  const stopFileWatcher = (watchId: string): void => {
    const active = fileWatchers.get(watchId);
    if (!active) return;
    if (active.timeout) clearTimeout(active.timeout);
    active.watcher.close();
    active.removeDestroyedListener();
    fileWatchers.delete(watchId);
  };

  ipcMain.handle('theme-preview-host:open', async (_event, request: ThemePreviewHostRequest) =>
    openThemePreviewHost(request),
  );

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
    const appWrite = { contents, revision: ++nextAppFileWriteRevision };
    appFileWrites.set(abs, appWrite);
    try {
      await writeFile(abs, contents, { encoding: 'utf-8' });
    } catch (error) {
      if (appFileWrites.get(abs)?.revision === appWrite.revision) {
        appFileWrites.delete(abs);
      }
      throw error;
    }
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

  ipcMain.handle('fs:watchFile', async (event, watchId: string, rel: string): Promise<void> => {
    stopFileWatcher(watchId);
    const abs = resolveSafeProjectRelativePath(rel, 'file');
    let lastContents: string | null;
    try {
      lastContents = await readFile(abs, 'utf-8');
    } catch {
      lastContents = null;
    }
    let lastSuppressedAppWriteRevision = appFileWrites.get(abs)?.revision ?? 0;

    const watcher = watch(dirname(abs), { persistent: false }, (_eventType, changedName) => {
      if (changedName && changedName.toString() !== basename(abs)) return;
      const active = fileWatchers.get(watchId);
      if (!active) return;
      if (active.timeout) clearTimeout(active.timeout);
      active.timeout = setTimeout(async () => {
        active.timeout = null;
        let contents: string | null;
        try {
          contents = await readFile(abs, 'utf-8');
        } catch {
          contents = null;
        }
        if (contents === lastContents) return;
        lastContents = contents;
        const appWrite = appFileWrites.get(abs);
        if (
          contents !== null
          && appWrite?.contents === contents
          && appWrite.revision > lastSuppressedAppWriteRevision
        ) {
          lastSuppressedAppWriteRevision = appWrite.revision;
          return;
        }
        if (!event.sender.isDestroyed()) {
          event.sender.send('fs:fileChanged', watchId);
        }
      }, 75);
    });

    const onDestroyed = () => stopFileWatcher(watchId);
    event.sender.once('destroyed', onDestroyed);
    fileWatchers.set(watchId, {
      watcher,
      timeout: null,
      removeDestroyedListener: () => event.sender.removeListener('destroyed', onDestroyed),
    });
  });

  ipcMain.handle('fs:unwatchFile', (_event, watchId: string): void => {
    stopFileWatcher(watchId);
  });

  /**
   * Full virtual desktop: layout + per-display PNG bytes (ScreenshotService).
   */
  ipcMain.handle('screenshot:getFullDisplaySnapshot', async () => {
    const displays = screen.getAllDisplays();
    /**
     * Very large thumbnail requests can stall or fail on some GPUs; cap for reliability.
     */
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
      bounds: BoundsDto;
      png: Buffer;
    }> = [];

    for (const src of capSources) {
      let bounds: BoundsDto | undefined;
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
        bounds,
        png,
      });
    }

    if (displayRows.length === 0) {
      return {
        fullBounds: { x: 0, y: 0, width: 0, height: 0 },
        displays: [],
      };
    }

    const minX = Math.min(...displayRows.map((r) => r.bounds.x));
    const minY = Math.min(...displayRows.map((r) => r.bounds.y));
    const maxX = Math.max(...displayRows.map((r) => r.bounds.x + r.bounds.width));
    const maxY = Math.max(...displayRows.map((r) => r.bounds.y + r.bounds.height));

    return {
      fullBounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      displays: displayRows,
    };
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
    getMainWindow()?.close();
  });

  ipcMain.handle('window:minimize', () => {
    getMainWindow()?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    getMainWindow()?.maximize();
  });

  ipcMain.handle('window:restore', () => {
    getMainWindow()?.unmaximize();
  });

  ipcMain.handle('window:drag', () => {
    // No-op; actual dragging typically uses -webkit-app-region: drag in CSS.
  });

  ipcMain.handle('window:reload', () => {
    getMainWindow()?.reload();
  });

  ipcMain.handle('window:reloadForce', async () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      await mainWindow.webContents.session.clearCache();
      mainWindow.reload();
    }
  });

  ipcMain.handle('window:toggleDevTools', () => {
    getMainWindow()?.webContents.toggleDevTools();
  });

  ipcMain.handle('window:getBounds', () => {
    const mainWindow = getMainWindow();
    if (mainWindow == null || mainWindow.isDestroyed()) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    return mainWindow.getBounds();
  });

  ipcMain.on('renderer-log', (_event, level: LogLevel, tag: string, args: string[]) => {
    const timestamp = args.length > 0 ? args[0] : new Date().toISOString();
    const messageArgs = args.length > 1 ? args.slice(1) : [];
    const prefix = `[${timestamp}] [${tag}]`;
    switch (level) {
      case 'debug':
      case 'info':
        console.log(prefix, ...messageArgs);
        break;
      case 'warn':
        console.warn(prefix, ...messageArgs);
        break;
      case 'error':
        console.error(prefix, ...messageArgs);
        break;
    }
  });
}

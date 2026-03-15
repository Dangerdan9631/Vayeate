import { app, BrowserWindow, desktopCapturer, ipcMain, net, screen } from 'electron';
import { rmSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Repository-relative data directory: vayeate-theme-studio/data */
const DATA_DIR = join(__dirname, '..', 'data');
import { createCatalogRepository } from '../src/gateway/data/catalog-repository';
import { createTemplateRepository } from '../src/gateway/data/template-repository';
import { createThemeRepository } from '../src/gateway/data/theme-repository';
import { createCatalogWithParams } from '../src/domain/controllers/catalog-controller';
import { createTemplateWithParams } from '../src/domain/controllers/template-controller';
import { createThemeWithParams } from '../src/domain/controllers/theme-controller';
import { getPreviewsDir, loadAllPreviews } from './preview-controller';
import { generateThemePair } from '../src/domain/utils/theme-generator';
import { exportThemePair } from '../src/domain/utils/theme-exporter';
import type { Catalog, Template, Theme } from '../src/model/schemas';

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

/** Project root themes directory (vayeate-theme-studio/../themes). */
const THEMES_OUTPUT_DIR = join(__dirname, '..', '..', 'themes');

/** App icon path (repo root images/icon.png) for window and dock/taskbar. */
const APP_ICON_PATH = join(__dirname, '..', '..', 'images', 'icon.png');

/** Undo stacks persisted under data/.undo; cleared on every app start. */
function getUndoStacksDir(): string {
  return join(DATA_DIR, '.undo');
}

/** UndoManagerV2 stacks: data/.undo/v2; one JSON file per stack. */
function getUndoV2Dir(): string {
  return getUndoStacksDir();
}

/** Sanitize docId (name@version) or stackId for use in filenames. */
function sanitizeDocId(docId: string): string {
  return docId.replace(/[\\/:*?"<>|+]/g, '_');
}

let mainWindow: BrowserWindow | null = null;

function getCatalogRepository() {
  return createCatalogRepository(DATA_DIR);
}

function getTemplateRepository() {
  return createTemplateRepository(DATA_DIR);
}

function getThemeRepository() {
  return createThemeRepository(DATA_DIR);
}

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

  const repo = getCatalogRepository();
  const templateRepo = getTemplateRepository();
  const themeRepo = getThemeRepository();

  ipcMain.handle('catalog:create', async (_event, params: { name: string; type: 'manual' | 'remote' }) => {
    const catalog = createCatalogWithParams(params);
    await repo.saveCatalog(catalog);
    return catalog;
  });

  ipcMain.handle('catalog:save', async (_event, catalog: Catalog) => {
    await repo.saveCatalog(catalog);
  });

  ipcMain.handle('catalog:load', async (_event, name: string, version: string) => {
    const result = await repo.loadCatalog(name, version);
    return result;
  });

  ipcMain.handle('catalog:list', async () => {
    const refs = await repo.listCatalogs();
    return refs;
  });

  ipcMain.handle('catalog:delete', async (_event, name: string, version: string) => {
    await repo.deleteCatalog(name, version);
  });

  ipcMain.handle('template:create', async (_event, params: { name: string }) => {
    const template = createTemplateWithParams(params);
    await templateRepo.saveTemplate(template);
    return template;
  });

  ipcMain.handle('template:save', async (_event, template: Template) => {
    await templateRepo.saveTemplate(template);
  });

  ipcMain.handle('template:load', async (_event, name: string, version: string) => {
    const result = await templateRepo.loadTemplate(name, version);
    return result;
  });

  ipcMain.handle('template:list', async () => {
    const refs = await templateRepo.listTemplates();
    return refs;
  });

  ipcMain.handle('template:delete', async (_event, name: string, version: string) => {
    await templateRepo.deleteTemplate(name, version);
  });

  ipcMain.handle('theme:create', async (_event, params: { name: string }) => {
    const theme = createThemeWithParams(params);
    await themeRepo.saveTheme(theme);
    return theme;
  });

  ipcMain.handle('theme:save', async (_event, theme: Theme) => {
    await themeRepo.saveTheme(theme);
  });

  ipcMain.handle('theme:load', async (_event, name: string, version: string) => {
    const result = await themeRepo.loadTheme(name, version);
    return result;
  });

  ipcMain.handle('theme:list', async () => {
    const refs = await themeRepo.listThemes();
    return refs;
  });

  /** All screen sources with display bounds for multi-monitor color picker. */
  ipcMain.handle('eyedropper:getScreenSourcesWithBounds', async () => {
    const [sources, displays] = await Promise.all([
      desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 0, height: 0 } }),
      Promise.resolve(screen.getAllDisplays()),
    ]);
    const byDisplayId = new Map<string, (typeof displays)[0]>();
    for (const d of displays) byDisplayId.set(String(d.id), d);
    const result: Array<{ sourceId: string; x: number; y: number; width: number; height: number }> = [];
    const usedDisplayIndex = new Set<number>();
    for (const src of sources) {
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
      result.push({
        sourceId: src.id,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      });
    }
    if (result.length === 0) return { sources: [], fullBounds: { x: 0, y: 0, width: 0, height: 0 } };
    const minX = Math.min(...result.map((r) => r.x));
    const minY = Math.min(...result.map((r) => r.y));
    const maxX = Math.max(...result.map((r) => r.x + r.width));
    const maxY = Math.max(...result.map((r) => r.y + r.height));
    return {
      sources: result,
      fullBounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    };
  });

  ipcMain.handle('theme:delete', async (_event, name: string, version: string) => {
    await themeRepo.deleteTheme(name, version);
  });

  const undoV2Dir = getUndoV2Dir();
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
  ipcMain.handle('config:save', async (_event, config: { colorScheme?: string }) => {
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  });

  ipcMain.handle('undoV2:save', async (_event, stackId: string, payload: string) => {
    if (!stackId) return;
    await mkdir(undoV2Dir, { recursive: true });
    const file = join(undoV2Dir, `${sanitizeDocId(stackId)}.json`);
    await writeFile(file, payload, 'utf-8');
  });
  ipcMain.handle('undoV2:load', async (_event, stackId: string): Promise<string | null> => {
    if (!stackId) return null;
    const file = join(undoV2Dir, `${sanitizeDocId(stackId)}.json`);
    try {
      return await readFile(file, 'utf-8');
    } catch {
      return null;
    }
  });
  ipcMain.handle('undoV2:clearPersisted', () => {
    rmSync(undoV2Dir, { recursive: true, force: true });
    mkdirSync(undoV2Dir, { recursive: true });
  });

  ipcMain.handle('theme:generate', async (
    _event,
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ) => {
    const theme = await themeRepo.loadTheme(themeName, themeVersion);
    if (!theme) {
      throw new Error(`Theme not found: ${themeName} v${themeVersion}`);
    }
    const template = await templateRepo.loadTemplate(templateName, templateVersion);
    if (!template) {
      throw new Error(`Template not found: ${templateName} v${templateVersion}`);
    }
    const { dark, light } = generateThemePair(theme, template);
    const { darkPath, lightPath } = await exportThemePair(
      THEMES_OUTPUT_DIR,
      theme.name,
      dark,
      light,
    );
    return { darkPath, lightPath };
  });

  ipcMain.handle('preview:loadAll', async () => {
    const previewsDir = getPreviewsDir(join(__dirname, '..'));
    return await loadAllPreviews(previewsDir);
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

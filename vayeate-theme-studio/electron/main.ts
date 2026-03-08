import { app, BrowserWindow, desktopCapturer, ipcMain, net, screen } from 'electron';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Repository-relative data directory: vayeate-theme-studio/data */
const DATA_DIR = join(__dirname, '..', 'data');
import { createCatalogRepository } from '../src/data/catalog-repository';
import { createTemplateRepository } from '../src/data/template-repository';
import { createThemeRepository } from '../src/data/theme-repository';
import { createCatalogWithParams } from '../src/controllers/catalog-controller';
import { createTemplateWithParams } from '../src/controllers/template-controller';
import { createThemeWithParams } from '../src/controllers/theme-controller';
import { getPreviewsDir, loadAllPreviews } from './preview-controller';
import { generateThemePair } from '../src/core/theme-generator';
import { exportThemePair } from '../src/core/theme-exporter';
import type { Catalog, Template, Theme } from '../src/model/schemas';

const TAG = '[Main]';

/** Project root themes directory (vayeate-theme-studio/../themes). */
const THEMES_OUTPUT_DIR = join(__dirname, '..', '..', 'themes');

/** App icon path (repo root images/icon.png) for window and dock/taskbar. */
const APP_ICON_PATH = join(__dirname, '..', '..', 'images', 'icon.png');

let mainWindow: BrowserWindow | null = null;

function getCatalogRepository() {
  console.debug(TAG, 'catalog repository baseDir:', DATA_DIR);
  return createCatalogRepository(DATA_DIR);
}

function getTemplateRepository() {
  console.debug(TAG, 'template repository baseDir:', DATA_DIR);
  return createTemplateRepository(DATA_DIR);
}

function getThemeRepository() {
  console.debug(TAG, 'theme repository baseDir:', DATA_DIR);
  return createThemeRepository(DATA_DIR);
}

function createWindow(): void {
  console.info(TAG, 'creating main window');
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
    console.info(TAG, 'loading dev server URL:', process.env.VITE_DEV_SERVER_URL);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = join(__dirname, '../dist/index.html');
    console.info(TAG, 'loading production build:', indexPath);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    console.info(TAG, 'main window closed');
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.info(TAG, 'app ready');
  await mkdir(join(DATA_DIR, 'catalogs'), { recursive: true });
  await mkdir(join(DATA_DIR, 'templates'), { recursive: true });
  await mkdir(join(DATA_DIR, 'themes'), { recursive: true });

  const repo = getCatalogRepository();
  const templateRepo = getTemplateRepository();
  const themeRepo = getThemeRepository();

  ipcMain.handle('catalog:create', async (_event, params: { name: string; type: 'manual' | 'remote' }) => {
    console.debug(TAG, 'IPC catalog:create', params.name, params.type);
    const catalog = createCatalogWithParams(params);
    await repo.saveCatalog(catalog);
    console.debug(TAG, 'IPC catalog:create →', catalog.name, `v${catalog.version}`);
    return catalog;
  });

  ipcMain.handle('catalog:save', async (_event, catalog: Catalog) => {
    console.debug(TAG, 'IPC catalog:save', catalog.name, `v${catalog.version}`, `(${catalog.tokens.length} tokens)`);
    await repo.saveCatalog(catalog);
    console.debug(TAG, 'IPC catalog:save complete');
  });

  ipcMain.handle('catalog:load', async (_event, name: string, version: string) => {
    console.debug(TAG, 'IPC catalog:load', name, `v${version}`);
    const result = await repo.loadCatalog(name, version);
    console.debug(TAG, 'IPC catalog:load →', result ? `${result.tokens.length} token(s)` : '(not found)');
    return result;
  });

  ipcMain.handle('catalog:list', async () => {
    console.debug(TAG, 'IPC catalog:list');
    const refs = await repo.listCatalogs();
    console.debug(TAG, 'IPC catalog:list →', refs.length, 'ref(s)');
    return refs;
  });

  ipcMain.handle('catalog:delete', async (_event, name: string, version: string) => {
    console.debug(TAG, 'IPC catalog:delete', name, `v${version}`);
    await repo.deleteCatalog(name, version);
    console.debug(TAG, 'IPC catalog:delete complete');
  });

  ipcMain.handle('template:create', async (_event, params: { name: string }) => {
    console.debug(TAG, 'IPC template:create', params.name);
    const template = createTemplateWithParams(params);
    await templateRepo.saveTemplate(template);
    console.debug(TAG, 'IPC template:create →', template.name, `v${template.version}`);
    return template;
  });

  ipcMain.handle('template:save', async (_event, template: Template) => {
    console.debug(TAG, 'IPC template:save', template.name, `v${template.version}`,
      `(${template.mappings.length} mappings)`);
    await templateRepo.saveTemplate(template);
    console.debug(TAG, 'IPC template:save complete');
  });

  ipcMain.handle('template:load', async (_event, name: string, version: string) => {
    console.debug(TAG, 'IPC template:load', name, `v${version}`);
    const result = await templateRepo.loadTemplate(name, version);
    console.debug(TAG, 'IPC template:load →', result ? `${result.mappings.length} mapping(s)` : '(not found)');
    return result;
  });

  ipcMain.handle('template:list', async () => {
    console.debug(TAG, 'IPC template:list');
    const refs = await templateRepo.listTemplates();
    console.debug(TAG, 'IPC template:list →', refs.length, 'ref(s)');
    return refs;
  });

  ipcMain.handle('template:delete', async (_event, name: string, version: string) => {
    console.debug(TAG, 'IPC template:delete', name, `v${version}`);
    await templateRepo.deleteTemplate(name, version);
    console.debug(TAG, 'IPC template:delete complete');
  });

  ipcMain.handle('theme:create', async (_event, params: { name: string }) => {
    console.debug(TAG, 'IPC theme:create', params.name);
    const theme = createThemeWithParams(params);
    await themeRepo.saveTheme(theme);
    console.debug(TAG, 'IPC theme:create →', theme.name, `v${theme.version}`);
    return theme;
  });

  ipcMain.handle('theme:save', async (_event, theme: Theme) => {
    console.debug(TAG, 'IPC theme:save', theme.name, `v${theme.version}`,
      `(${theme.colorAssignments.length} color, ${theme.contrastAssignments.length} contrast)`);
    try {
      await themeRepo.saveTheme(theme);
      console.debug(TAG, 'IPC theme:save complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(TAG, 'theme:save failed', message);
      throw err;
    }
  });

  ipcMain.handle('theme:load', async (_event, name: string, version: string) => {
    console.debug(TAG, 'IPC theme:load', name, `v${version}`);
    const result = await themeRepo.loadTheme(name, version);
    console.debug(TAG, 'IPC theme:load →', result ? `${result.colorAssignments.length} color assignment(s)` : '(not found)');
    return result;
  });

  ipcMain.handle('theme:list', async () => {
    console.debug(TAG, 'IPC theme:list');
    const refs = await themeRepo.listThemes();
    console.debug(TAG, 'IPC theme:list →', refs.length, 'ref(s)');
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
    console.debug(TAG, 'IPC theme:delete', name, `v${version}`);
    await themeRepo.deleteTheme(name, version);
    console.debug(TAG, 'IPC theme:delete complete');
  });

  ipcMain.handle('theme:generate', async (
    _event,
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ) => {
    console.debug(TAG, 'IPC theme:generate', themeName, templateName);
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
    console.debug(TAG, 'IPC theme:generate →', darkPath, lightPath);
    return { darkPath, lightPath };
  });

  ipcMain.handle('preview:loadAll', async () => {
    const previewsDir = getPreviewsDir(join(__dirname, '..'));
    return await loadAllPreviews(previewsDir);
  });

  ipcMain.handle('net:fetch', async (_event, url: string) => {
    console.debug(TAG, 'IPC net:fetch', url);
    const response = await net.fetch(url);
    if (!response.ok) {
      console.error(TAG, 'IPC net:fetch failed', url, response.status, response.statusText);
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    console.debug(TAG, 'IPC net:fetch →', text.length, 'chars');
    return text;
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
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

  app.on('activate', () => {
    console.debug(TAG, 'app activate');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.info(TAG, 'all windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

import { app, BrowserWindow, ipcMain, net } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { createCatalogRepository } from '../src/data/catalog-repository';
import { createCatalogWithParams } from '../src/controllers/catalog-controller';
import type { Catalog } from '../src/model/schemas';

const TAG = '[Main]';

let mainWindow: BrowserWindow | null = null;

function getCatalogRepository() {
  const baseDir = app.getPath('userData');
  console.debug(TAG, 'catalog repository baseDir:', baseDir);
  return createCatalogRepository(baseDir);
}

function createWindow(): void {
  console.info(TAG, 'creating main window');
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

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

app.whenReady().then(() => {
  console.info(TAG, 'app ready');
  const repo = getCatalogRepository();

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

import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { createCatalogRepository } from '../src/data/catalog-repository';
import { createCatalog } from '../src/controllers/catalog-controller';
import type { Catalog } from '../src/model/schemas';

let mainWindow: BrowserWindow | null = null;

function getCatalogRepository() {
  const baseDir = app.getPath('userData');
  return createCatalogRepository(baseDir);
}

function createWindow(): void {
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
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const repo = getCatalogRepository();

  ipcMain.handle('catalog:create', async () => {
    const catalog = createCatalog();
    await repo.saveCatalog(catalog);
    return catalog;
  });

  ipcMain.handle('catalog:save', async (_event, catalog: Catalog) => {
    await repo.saveCatalog(catalog);
  });

  ipcMain.handle('catalog:load', async (_event, name: string, version: string) => {
    return await repo.loadCatalog(name, version);
  });

  ipcMain.handle('catalog:list', async () => {
    return await repo.listCatalogs();
  });

  createWindow();

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

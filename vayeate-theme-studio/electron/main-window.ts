import { BrowserWindow } from 'electron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_ICON_PATH } from './paths';

const __dirname = dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function createMainWindow(): void {
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

  mainWindow.webContents.openDevTools();

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
}

import { contextBridge, ipcRenderer } from 'electron';

const _rawConfig = ipcRenderer.sendSync('config:loadSync') as { colorScheme?: string } | null;
const initialColorScheme: 'light' | 'dark' =
  _rawConfig?.colorScheme === 'light' ? 'light' : 'dark';

const electronAPI = {
  fetchUrl: (url: string) => ipcRenderer.invoke('net:fetch', url) as Promise<string>,
  /** Multi-monitor layout + per-display PNG bytes (ScreenshotService). */
  screenshotGetFullDisplaySnapshot: () =>
    ipcRenderer.invoke('screenshot:getFullDisplaySnapshot') as Promise<{
      fullBounds: { x: number; y: number; width: number; height: number };
      displays: Array<{
        sourceId: string;
        x: number;
        y: number;
        width: number;
        height: number;
        png: Uint8Array;
      }>;
    }>,
  closeWindow: () => ipcRenderer.invoke('window:close'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  restoreWindow: () => ipcRenderer.invoke('window:restore'),
  dragWindow: () => ipcRenderer.invoke('window:drag'),
  reloadWindow: () => ipcRenderer.invoke('window:reload'),
  reloadWindowForce: () => ipcRenderer.invoke('window:reloadForce'),
  toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),
  getWindowBounds: () =>
    ipcRenderer.invoke('window:getBounds') as Promise<{ x: number; y: number; width: number; height: number }>,
  /** Subscribe to main process logs so they appear in the renderer DevTools console. */
  onMainLog: (callback: (level: 'debug' | 'info' | 'warn' | 'error', args: string[]) => void) => {
    ipcRenderer.on('main-log', (_event, level: 'debug' | 'info' | 'warn' | 'error', args: string[]) =>
      callback(level, args),
    );
  },
  /** Subscribe to window state events from main (minimize, maximize, unmaximize, restore). Returns unsubscribe. */
  onWindowState: (callback: (event: 'minimized' | 'maximized' | 'unmaximized' | 'restored') => void) => {
    const onMinimized = () => callback('minimized');
    const onMaximized = () => callback('maximized');
    const onUnmaximized = () => callback('unmaximized');
    const onRestored = () => callback('restored');
    ipcRenderer.on('window:minimized', onMinimized);
    ipcRenderer.on('window:maximized', onMaximized);
    ipcRenderer.on('window:unmaximized', onUnmaximized);
    ipcRenderer.on('window:restored', onRestored);
    return () => {
      ipcRenderer.removeListener('window:minimized', onMinimized);
      ipcRenderer.removeListener('window:maximized', onMaximized);
      ipcRenderer.removeListener('window:unmaximized', onUnmaximized);
      ipcRenderer.removeListener('window:restored', onRestored);
    };
  },
  /** Subscribe to window resize events from main. Returns unsubscribe. */
  onWindowResize: (callback: (size: { width: number; height: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, width: number, height: number) =>
      callback({ width, height });
    ipcRenderer.on('window:resized', handler);
    return () => ipcRenderer.removeListener('window:resized', handler);
  },
  /** Subscribe to window move events from main. Returns unsubscribe. */
  onWindowMove: (callback: (position: { x: number; y: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, x: number, y: number) =>
      callback({ x, y });
    ipcRenderer.on('window:moved', handler);
    return () => ipcRenderer.removeListener('window:moved', handler);
  },
  /** Send renderer logs to main process so they appear in the IDE/terminal console. */
  sendLog: (level: 'debug' | 'info' | 'warn' | 'error', tag: string, args: string[]) => {
    ipcRenderer.send('renderer-log', level, tag, args);
  },
  fsCreateFile: (relativePath: string) => ipcRenderer.invoke('fs:createFile', relativePath),
  fsSaveFile: (relativePath: string, contents: string) =>
    ipcRenderer.invoke('fs:saveFile', relativePath, contents),
  fsLoadFile: (relativePath: string) =>
    ipcRenderer.invoke('fs:loadFile', relativePath) as Promise<string | null>,
  fsDeleteFile: (relativePath: string) => ipcRenderer.invoke('fs:deleteFile', relativePath),
  fsListFiles: (relativeDirPath: string) =>
    ipcRenderer.invoke('fs:listFiles', relativeDirPath) as Promise<string[]>,
  fsListDirEntries: (relativeDirPath: string) =>
    ipcRenderer.invoke('fs:listDirEntries', relativeDirPath) as Promise<
      Array<{ name: string; isDirectory: boolean }>
    >,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
contextBridge.exposeInMainWorld('electronInitialColorScheme', initialColorScheme);

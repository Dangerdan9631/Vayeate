import { contextBridge, ipcRenderer } from 'electron';

const _rawConfig = ipcRenderer.sendSync('config:loadSync') as { colorScheme?: string } | null;
const initialColorScheme: 'light' | 'dark' =
  _rawConfig?.colorScheme === 'dark' ? 'dark' : 'light';

const electronAPI = {
  saveCatalog: (catalog: unknown) => ipcRenderer.invoke('catalog:save', catalog),
  loadCatalog: (name: string, version: string) =>
    ipcRenderer.invoke('catalog:load', name, version),
  listCatalogs: () => ipcRenderer.invoke('catalog:list'),
  createCatalog: (params: { name: string; type: 'manual' | 'remote' }) =>
    ipcRenderer.invoke('catalog:create', params),
  deleteCatalog: (name: string, version: string) =>
    ipcRenderer.invoke('catalog:delete', name, version),
  createTemplate: (params: { name: string }) =>
    ipcRenderer.invoke('template:create', params),
  saveTemplate: (template: unknown) => ipcRenderer.invoke('template:save', template),
  loadTemplate: (name: string, version: string) =>
    ipcRenderer.invoke('template:load', name, version),
  listTemplates: () => ipcRenderer.invoke('template:list'),
  deleteTemplate: (name: string, version: string) =>
    ipcRenderer.invoke('template:delete', name, version),
  createTheme: (params: { name: string }) =>
    ipcRenderer.invoke('theme:create', params),
  saveTheme: (theme: unknown) => ipcRenderer.invoke('theme:save', theme),
  loadTheme: (name: string, version: string) =>
    ipcRenderer.invoke('theme:load', name, version),
  listThemes: () => ipcRenderer.invoke('theme:list'),
  deleteTheme: (name: string, version: string) =>
    ipcRenderer.invoke('theme:delete', name, version),
  generateTheme: (
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ) =>
    ipcRenderer.invoke('theme:generate', themeName, themeVersion, templateName, templateVersion),
  fetchUrl: (url: string) => ipcRenderer.invoke('net:fetch', url) as Promise<string>,
  loadPreviews: () => ipcRenderer.invoke('preview:loadAll'),
  /** All screen sources + bounds for full-screen color picker (multi-monitor, no feedback). */
  eyedropperGetScreenSourcesWithBounds: () =>
    ipcRenderer.invoke('eyedropper:getScreenSourcesWithBounds') as Promise<{
      sources: Array<{ sourceId: string; x: number; y: number; width: number; height: number }>;
      fullBounds: { x: number; y: number; width: number; height: number };
    }>,
  closeWindow: () => ipcRenderer.invoke('window:close'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  restoreWindow: () => ipcRenderer.invoke('window:restore'),
  dragWindow: () => ipcRenderer.invoke('window:drag'),
  reloadWindow: () => ipcRenderer.invoke('window:reload'),
  reloadWindowForce: () => ipcRenderer.invoke('window:reloadForce'),
  toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),
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
  undoV2Save: (stackId: string, payload: string) =>
    ipcRenderer.invoke('undoV2:save', stackId, payload),
  undoV2Load: (stackId: string) =>
    ipcRenderer.invoke('undoV2:load', stackId) as Promise<string | null>,
  undoV2ClearPersisted: () => ipcRenderer.invoke('undoV2:clearPersisted'),
  saveConfig: (config: { colorScheme?: string }) => ipcRenderer.invoke('config:save', config),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
contextBridge.exposeInMainWorld('electronInitialColorScheme', initialColorScheme);

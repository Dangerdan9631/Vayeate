import { contextBridge, ipcRenderer } from 'electron';

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
  /** Send renderer logs to main process so they appear in the IDE/terminal console. */
  sendLog: (level: 'debug' | 'info' | 'warn' | 'error', tag: string, args: string[]) => {
    ipcRenderer.send('renderer-log', level, tag, args);
  },
  undoSave: (pane: 'themes' | 'templates' | 'catalogs', docId: string, payload: string) =>
    ipcRenderer.invoke('undo:save', pane, docId, payload),
  undoLoad: (pane: 'themes' | 'templates' | 'catalogs', docId: string) =>
    ipcRenderer.invoke('undo:load', pane, docId) as Promise<string | null>,
  undoClearAll: () => ipcRenderer.invoke('undo:clearAll'),
  undoV2Save: (stackId: string, payload: string) =>
    ipcRenderer.invoke('undoV2:save', stackId, payload),
  undoV2Load: (stackId: string) =>
    ipcRenderer.invoke('undoV2:load', stackId) as Promise<string | null>,
  undoV2ClearPersisted: () => ipcRenderer.invoke('undoV2:clearPersisted'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

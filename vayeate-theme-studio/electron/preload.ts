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
  reloadWindow: () => ipcRenderer.invoke('window:reload'),
  reloadWindowForce: () => ipcRenderer.invoke('window:reloadForce'),
  toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

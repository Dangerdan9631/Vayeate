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
  fetchUrl: (url: string) => ipcRenderer.invoke('net:fetch', url) as Promise<string>,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

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
  fetchUrl: (url: string) => ipcRenderer.invoke('net:fetch', url) as Promise<string>,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  saveCatalog: (catalog: unknown) => ipcRenderer.invoke('catalog:save', catalog),
  loadCatalog: (name: string, version: string) =>
    ipcRenderer.invoke('catalog:load', name, version),
  listCatalogs: () => ipcRenderer.invoke('catalog:list'),
  createCatalog: () => ipcRenderer.invoke('catalog:create'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

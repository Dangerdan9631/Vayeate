import type { Catalog } from '../model/schemas';

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const catalogService = {
  createCatalog: async (params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> => {
    return await getAPI().createCatalog(params);
  },
  saveCatalog: async (catalog: Catalog): Promise<void> => {
    await getAPI().saveCatalog(catalog);
  },
  loadCatalog: async (name: string, version: string): Promise<Catalog | null> => {
    return await getAPI().loadCatalog(name, version);
  },
  listCatalogs: async () => {
    return await getAPI().listCatalogs();
  },
  deleteCatalog: async (name: string, version: string): Promise<void> => {
    await getAPI().deleteCatalog(name, version);
  },
  fetchUrl: async (url: string): Promise<string> => {
    return await getAPI().fetchUrl(url);
  },
};

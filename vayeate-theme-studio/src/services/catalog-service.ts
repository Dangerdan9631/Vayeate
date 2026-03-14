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
    const catalog = await getAPI().createCatalog(params);
    return catalog;
  },
  saveCatalog: async (catalog: Catalog): Promise<void> => {
    await getAPI().saveCatalog(catalog);
  },
  loadCatalog: async (name: string, version: string): Promise<Catalog | null> => {
    const catalog = await getAPI().loadCatalog(name, version);
    return catalog;
  },
  listCatalogs: async () => {
    const refs = await getAPI().listCatalogs();
    return refs;
  },
  deleteCatalog: async (name: string, version: string): Promise<void> => {
    await getAPI().deleteCatalog(name, version);
  },
  fetchUrl: async (url: string): Promise<string> => {
    const text = await getAPI().fetchUrl(url);
    return text;
  },
};

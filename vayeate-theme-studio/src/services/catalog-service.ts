import type { Catalog } from '../model/schemas';

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const catalogService = {
  createCatalog: async (): Promise<Catalog> => {
    return await getAPI().createCatalog();
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
};

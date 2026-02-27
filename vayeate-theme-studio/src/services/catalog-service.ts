import type { Catalog } from '../model/schemas';
import { createLogger } from '../utils/logger';

const log = createLogger('CatalogService');

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const catalogService = {
  createCatalog: async (params: { name: string; type: 'manual' | 'remote' }): Promise<Catalog> => {
    log.debug('IPC catalog:create', params.name, params.type);
    const catalog = await getAPI().createCatalog(params);
    log.debug('IPC catalog:create →', catalog.name, `v${catalog.version}`);
    return catalog;
  },
  saveCatalog: async (catalog: Catalog): Promise<void> => {
    log.debug('IPC catalog:save', catalog.name, `v${catalog.version}`, `(${catalog.tokens.length} tokens)`);
    await getAPI().saveCatalog(catalog);
    log.debug('IPC catalog:save complete');
  },
  loadCatalog: async (name: string, version: string): Promise<Catalog | null> => {
    log.debug('IPC catalog:load', name, `v${version}`);
    const catalog = await getAPI().loadCatalog(name, version);
    log.debug('IPC catalog:load →', catalog ? `${catalog.tokens.length} token(s)` : '(not found)');
    return catalog;
  },
  listCatalogs: async () => {
    log.debug('IPC catalog:list');
    const refs = await getAPI().listCatalogs();
    log.debug('IPC catalog:list →', refs.length, 'ref(s)');
    return refs;
  },
  deleteCatalog: async (name: string, version: string): Promise<void> => {
    log.debug('IPC catalog:delete', name, `v${version}`);
    await getAPI().deleteCatalog(name, version);
    log.debug('IPC catalog:delete complete');
  },
  fetchUrl: async (url: string): Promise<string> => {
    log.debug('IPC net:fetch', url);
    const text = await getAPI().fetchUrl(url);
    log.debug('IPC net:fetch →', text.length, 'chars');
    return text;
  },
};

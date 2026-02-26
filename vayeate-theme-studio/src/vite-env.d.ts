/// <reference types="vite/client" />

import type { Catalog, CatalogReference } from './model/schemas';

declare global {
  interface Window {
    electronAPI?: {
      saveCatalog: (catalog: Catalog) => Promise<void>;
      loadCatalog: (name: string, version: string) => Promise<Catalog | null>;
      listCatalogs: () => Promise<CatalogReference[]>;
      createCatalog: (params: { name: string; type: 'manual' | 'remote' }) => Promise<Catalog>;
      deleteCatalog: (name: string, version: string) => Promise<void>;
    };
  }
}

export {};

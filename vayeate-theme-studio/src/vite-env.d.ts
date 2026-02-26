/// <reference types="vite/client" />

import type { Catalog, CatalogReference } from './model/schemas';

declare global {
  interface Window {
    electronAPI?: {
      saveCatalog: (catalog: Catalog) => Promise<void>;
      loadCatalog: (name: string, version: string) => Promise<Catalog | null>;
      listCatalogs: () => Promise<CatalogReference[]>;
      createCatalog: () => Promise<Catalog>;
    };
  }
}

export {};

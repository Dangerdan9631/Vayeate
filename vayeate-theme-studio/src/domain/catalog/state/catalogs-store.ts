import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { CatalogMap, type CatalogsState, initialCatalogsState } from './catalogs-state';
import type { Catalog } from '../../../model/schema/catalog';
import type { CatalogReference } from '../../../model/schema/template-schemas';

interface CatalogsStoreState {
  state: CatalogsState;
  updateCatalogRefs: (refs: CatalogReference[]) => void;
  upsertCatalogs: (catalogs: Catalog[]) => void;
}

export function getCurrentCatalog(catalogMap: CatalogMap, selectedRef: CatalogReference | null): Catalog | null {
  if (!selectedRef) return null;
  const catalog = catalogMap[selectedRef.name]?.[selectedRef.version];
  if (!catalog || !catalog.isLoaded) return null;
  return catalog.catalog;
}

export function getCurrentCatalogRefs(catalogMap: CatalogMap): CatalogReference[] {
  const refs: CatalogReference[] = [];
  for (const name of Object.keys(catalogMap).sort()) {
    for (const version of Object.keys(catalogMap[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

export function getAllLoadedCatalogs(catalogMap: CatalogMap): Catalog[] {
  const catalogs: Catalog[] = [];
  for (const name of Object.keys(catalogMap)) {
    for (const version of Object.keys(catalogMap[name]!)) {
      const entry = catalogMap[name]![version];
      if (entry && entry.isLoaded && entry.catalog) {
        catalogs.push(entry.catalog as Catalog);
      }
    }
  }
  return catalogs;
}

function ensureCatalogRef(catalogMap: CatalogMap, ref: CatalogReference): void {
  if (!catalogMap[ref.name]) {
    catalogMap[ref.name] = {};
  }

  if (!catalogMap[ref.name][ref.version]) {
    catalogMap[ref.name][ref.version] = {
      isLoaded: false,
      catalog: null,
    };
  }
}

@singleton()
export class CatalogsStore {
  private store = createStore<CatalogsStoreState>()(
    immer((set): CatalogsStoreState => ({
      state: initialCatalogsState,
      updateCatalogRefs: (refs: CatalogReference[]) => set((storeState) => {
        const catalogs: CatalogMap = {};
        refs.forEach((ref) => {
          const existing = storeState.state.catalogs[ref.name]?.[ref.version];
          ensureCatalogRef(catalogs, ref);
          if (existing) {
            catalogs[ref.name][ref.version] = storeState.state.catalogs[ref.name][ref.version];
          }
        });

        storeState.state.catalogs = castDraft(catalogs);
      }),
      upsertCatalogs: (catalogs: Catalog[]) => set((storeState) => {
        catalogs.forEach((catalog) => {
          const ref = {
            name: catalog.name,
            version: catalog.version,
          };
          ensureCatalogRef(storeState.state.catalogs, ref);
          storeState.state.catalogs[ref.name][ref.version] = {
            isLoaded: true,
            catalog: castDraft(catalog),
          };
        });
      }),
    }))
  );

  get api() {
    return this.store;
  }

  getStore(): CatalogsStoreState {
    return this.store.getState();
  }
}

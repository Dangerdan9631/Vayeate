import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { CatalogMap, CatalogsStateV2, initialCatalogsStateV2 } from './catalogs-state';
import type { Catalog } from '../../../model/schema/catalog';
import type { CatalogReference } from '../../../model/schema/template-schemas';

interface CatalogsStoreState {
  stateV2: CatalogsStateV2;
  updateCatalogRefs: (refs: CatalogReference[]) => void;
  updateCatalog: (catalog: Catalog) => void;
  updateCatalogs: (catalogs: Catalog[]) => void;
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

@singleton()
export class CatalogsStore {
  private store = createStore<CatalogsStoreState>()(
    immer((set): CatalogsStoreState => ({
      stateV2: initialCatalogsStateV2,
      updateCatalogRefs: (refs: CatalogReference[]) => set((storeState) => {
        refs.forEach((ref) => {
          if (!storeState.stateV2.catalogs[ref.name]) {
            storeState.stateV2.catalogs[ref.name] = {};
          }
          if (!storeState.stateV2.catalogs[ref.name][ref.version]) {
            storeState.stateV2.catalogs[ref.name][ref.version] = {
              isLoaded: false,
              catalog: null,
            };
          }
        });
      }),
      updateCatalog: (catalog: Catalog) => set((storeState) => {
        const catalogRef = {
          name: catalog.name,
          version: catalog.version,
        };
        if (!storeState.stateV2.catalogs[catalogRef.name]) {
          storeState.stateV2.catalogs[catalogRef.name] = {};
        }
        storeState.stateV2.catalogs[catalogRef.name][catalogRef.version] = {
          isLoaded: true,
          catalog: castDraft(catalog),
        };
      }),
      updateCatalogs: (catalogs: Catalog[]) => set((storeState) => {
        catalogs.forEach((catalog) => {
          const catalogRef = {
            name: catalog.name,
            version: catalog.version,
          };
          if (!storeState.stateV2.catalogs[catalogRef.name]) {
            storeState.stateV2.catalogs[catalogRef.name] = {};
          }
          storeState.stateV2.catalogs[catalogRef.name][catalogRef.version] = {
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

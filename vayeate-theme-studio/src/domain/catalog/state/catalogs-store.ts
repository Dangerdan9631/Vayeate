import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import { castDraft } from 'immer';
import { singleton } from 'tsyringe';
import { CatalogMap, type CatalogsState, initialCatalogsState } from './catalogs-state';
import type { Catalog } from '../../../model/schema/catalog';
import type { CatalogReference } from '../../../model/schema/template-schemas';

interface CatalogsStoreState {
  state: CatalogsState;
  /**
   * Replace the ref map from a gateway list while preserving loaded bodies for matching refs.
   */
  updateCatalogRefs: (refs: CatalogReference[]) => void;
  /**
   * Merge loaded catalog bodies into the map, creating ref slots as needed.
   */
  upsertCatalogs: (catalogs: Catalog[]) => void;
}

/**
 * Resolves the loaded catalog body for the given selection, if any.
 *
 * @param catalogMap - Current catalogs map from store state.
 * @param selectedRef - Selected name/version ref, or null when nothing is selected.
 * @returns Loaded catalog entity, or null when missing or not yet loaded.
 */
export function getCurrentCatalog(catalogMap: CatalogMap, selectedRef: CatalogReference | null): Catalog | null {
  if (!selectedRef) return null;
  const catalog = catalogMap[selectedRef.name]?.[selectedRef.version];
  if (!catalog || !catalog.isLoaded) return null;
  return catalog.catalog;
}

/**
 * Builds a sorted flat list of every catalog ref present in the map.
 *
 * @param catalogMap - Current catalogs map from store state.
 * @returns Name/version pairs in stable name-then-version order.
 */
export function getCurrentCatalogRefs(catalogMap: CatalogMap): CatalogReference[] {
  const refs: CatalogReference[] = [];
  for (const name of Object.keys(catalogMap).sort()) {
    for (const version of Object.keys(catalogMap[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

/**
 * Collects every catalog whose body is loaded in the map.
 *
 * @param catalogMap - Current catalogs map from store state.
 * @returns All loaded catalog entities (order follows map iteration).
 */
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

/**
 * Zustand store for catalog refs and loaded catalog bodies.
 */
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

  /**
   * React subscription API for viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current store snapshot including mutation methods.
   *
   * @returns Live catalogs state and upsert/update helpers for operations.
   */
  getStore(): CatalogsStoreState {
    return this.store.getState();
  }
}

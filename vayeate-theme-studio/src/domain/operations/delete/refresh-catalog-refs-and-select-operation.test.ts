import { describe, expect, it, vi } from 'vitest';
import { catalogSchema } from '../../../model/schema/catalog';
import { CatalogsStore } from '../../catalog/state/catalogs-store';
import { CatalogUiStore } from '../../state/ui/catalog-ui-store';
import { RefreshCatalogRefsAndSelectOperation } from './refresh-catalog-refs-and-select-operation';

describe('RefreshCatalogRefsAndSelectOperation', () => {
  const catalog = catalogSchema.parse({
    name: 'catalog-a',
    version: '1.0.0',
    type: 'manual',
    locked: false,
    sources: [],
    tokens: [],
  });

  it('skips directory listing when refs are unchanged', () => {
    const catalogsStore = new CatalogsStore();
    const catalogUiStore = new CatalogUiStore();
    const listCatalogs = vi.fn();
    const enqueueBackgroundAction = { execute: vi.fn() };

    new RefreshCatalogRefsAndSelectOperation(
      catalogsStore,
      catalogUiStore,
      { listCatalogs, loadCatalog: vi.fn() } as never,
      enqueueBackgroundAction as never,
    ).execute(catalog.name, catalog.version, catalog, false);

    expect(listCatalogs).not.toHaveBeenCalled();
    expect(enqueueBackgroundAction.execute).not.toHaveBeenCalled();
    expect(catalogUiStore.getStore().state.selectedRef).toEqual({
      name: 'catalog-a',
      version: '1.0.0',
    });
    expect(catalogUiStore.getStore().state.catalogLoadState).toBe('loaded');
  });

  it('re-lists catalogs when refs changed', async () => {
    const catalogsStore = new CatalogsStore();
    const catalogUiStore = new CatalogUiStore();
    const listCatalogs = vi.fn(async () => [{ name: 'catalog-a', version: '1.0.1' }]);
    const enqueueBackgroundAction = {
      execute: vi.fn((_queue: string, _desc: string, run: () => Promise<void>) => {
        void run();
        return { onQueue: () => ({ then: () => {} }), then: () => {} };
      }),
    };

    new RefreshCatalogRefsAndSelectOperation(
      catalogsStore,
      catalogUiStore,
      { listCatalogs, loadCatalog: vi.fn() } as never,
      enqueueBackgroundAction as never,
    ).execute('catalog-a', '1.0.1', { ...catalog, version: '1.0.1' }, true);

    await vi.waitFor(() => {
      expect(listCatalogs).toHaveBeenCalled();
    });
    expect(catalogsStore.getStore().state.catalogs['catalog-a']?.['1.0.1']).toBeDefined();
    expect(enqueueBackgroundAction.execute).toHaveBeenCalled();
  });
});

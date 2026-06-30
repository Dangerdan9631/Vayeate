import { describe, expect, it, vi } from 'vitest';
import { catalogSchema } from '../../../model/schema/catalog';
import { ApplyCatalogUndoStateOperation } from './apply-catalog-undo-state-operation';

describe('apply catalog undo state operation', () => {
  it('upserts, selects, saves, and refreshes the catalog snapshot', () => {
    const catalog = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
    });
    const upsertCatalogs = vi.fn();
    const selectCatalog = vi.fn();
    const saveCatalog = { execute: vi.fn() };
    const refreshCatalogRefsAndSelect = { execute: vi.fn() };

    new ApplyCatalogUndoStateOperation(
      { getStore: () => ({ upsertCatalogs, state: { catalogs: {} } }) } as never,
      { getStore: () => ({ selectCatalog, state: { selectedRef: null } }) } as never,
      saveCatalog as never,
      refreshCatalogRefsAndSelect as never,
    ).execute(catalog);

    expect(upsertCatalogs).toHaveBeenCalledWith([catalog]);
    expect(selectCatalog).toHaveBeenCalledWith({ name: 'catalog-a', version: '1.0.0' });
    expect(saveCatalog.execute).toHaveBeenCalledWith(catalog);
    expect(refreshCatalogRefsAndSelect.execute).toHaveBeenCalledWith('catalog-a', '1.0.0', catalog, false);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Catalog } from '../../../model/schemas';
import { CatalogService } from '../../../gateway/services/catalog-service';
import { CatalogSyncService } from '../../../gateway/services/catalog-sync';
import {
  LoadCatalogRefs,
  createCatalog,
  deleteCatalog,
  loadCatalog,
  saveCatalog,
  syncCatalog,
} from '.';
import { StoreStateSetter } from '../../state/store-state-setter';

const catalogServiceMock = {
  createCatalog: vi.fn(),
  saveCatalog: vi.fn(),
  loadCatalog: vi.fn(),
  listCatalogs: vi.fn(),
  deleteCatalog: vi.fn(),
  fetchUrl: vi.fn(),
};

const catalogSyncServiceMock = {
  sync: vi.fn(),
};

describe('catalog-operations', () => {
  beforeEach(() => {
    container.registerInstance(CatalogService, catalogServiceMock as unknown as CatalogService);
    container.registerInstance(
      CatalogSyncService,
      catalogSyncServiceMock as unknown as CatalogSyncService,
    );
    vi.mocked(catalogServiceMock.createCatalog).mockResolvedValue({ name: 'c1', version: '1.0.0' } as Catalog);
    vi.mocked(catalogServiceMock.saveCatalog).mockResolvedValue(undefined);
    vi.mocked(catalogServiceMock.loadCatalog).mockResolvedValue({ name: 'c1', version: '1.0.0' } as Catalog);
    vi.mocked(catalogServiceMock.listCatalogs).mockResolvedValue([{ name: 'c1', version: '1.0.0' }]);
    vi.mocked(catalogServiceMock.deleteCatalog).mockResolvedValue(undefined);
    vi.mocked(catalogServiceMock.fetchUrl).mockResolvedValue('{}');
    vi.mocked(catalogSyncServiceMock.sync).mockResolvedValue({
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createCatalog calls catalogService.createCatalog and returns catalog', async () => {
    const setState = vi.fn();
    const result = await createCatalog(setState, { name: 'c1', type: 'manual' });

    expect(catalogServiceMock.createCatalog).toHaveBeenCalledTimes(1);
    expect(catalogServiceMock.createCatalog).toHaveBeenCalledWith({ name: 'c1', type: 'manual' });
    expect(result).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('LoadCatalogRefs.execute sets store entries from listCatalogs result', async () => {
    const setStoreState = vi.fn();
    const op = new LoadCatalogRefs(
      new StoreStateSetter(setStoreState),
      container.resolve(CatalogService),
    );

    await op.execute();

    expect(catalogServiceMock.listCatalogs).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_CATALOG_ENTRIES',
      entries: [{ name: 'c1', version: '1.0.0', isLoaded: false, catalog: undefined }],
    });
  });

  it('loadCatalog loads a catalog and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadCatalog(setState, 'c1', '1.0.0');

    expect(catalogServiceMock.loadCatalog).toHaveBeenCalledTimes(1);
    expect(catalogServiceMock.loadCatalog).toHaveBeenCalledWith('c1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_CATALOG',
      catalog: { name: 'c1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('saveCatalog calls catalogService.saveCatalog', async () => {
    const catalog = { name: 'c1', version: '1.0.0' } as Catalog;

    await saveCatalog(catalog);

    expect(catalogServiceMock.saveCatalog).toHaveBeenCalledTimes(1);
    expect(catalogServiceMock.saveCatalog).toHaveBeenCalledWith(catalog);
  });

  it('deleteCatalog calls catalogService.deleteCatalog', async () => {
    await deleteCatalog('c1', '1.0.0');

    expect(catalogServiceMock.deleteCatalog).toHaveBeenCalledTimes(1);
    expect(catalogServiceMock.deleteCatalog).toHaveBeenCalledWith('c1', '1.0.0');
  });

  it('syncCatalog preserves version when catalog is unlocked', async () => {
    const catalog = {
      name: 'c1',
      version: '1.0.0',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    } as unknown as Catalog;

    const result = await syncCatalog(catalog);

    expect(catalogSyncServiceMock.sync).toHaveBeenCalledTimes(1);
    expect(catalogSyncServiceMock.sync).toHaveBeenCalledWith(catalog.sources);
    expect(result.version).toBe('1.0.0');
    expect(result.locked).toBe(true);
  });

  it('syncCatalog bumps patch version when catalog is locked', async () => {
    const catalog = {
      name: 'c1',
      version: '1.0.0',
      locked: true,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    } as unknown as Catalog;

    const result = await syncCatalog(catalog);

    expect(catalogSyncServiceMock.sync).toHaveBeenCalledTimes(1);
    expect(result.version).toBe('1.0.1');
    expect(result.locked).toBe(true);
  });
});

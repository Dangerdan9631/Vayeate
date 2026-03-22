import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Catalog } from '../../../model/schemas';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { TokenSyncGateway } from '../../../gateway/catalog/token-sync-gateway';
import {
  LoadCatalogRefs,
  createCatalog,
  deleteCatalog,
  loadCatalog,
  saveCatalog,
  syncCatalog,
} from '.';
import { StoreStateSetter } from '../../state/store-state-setter';

const catalogGatewayMock = {
  createCatalog: vi.fn(),
  saveCatalog: vi.fn(),
  loadCatalog: vi.fn(),
  listCatalogs: vi.fn(),
  deleteCatalog: vi.fn(),
};

const tokenSyncGatewayMock = {
  sync: vi.fn(),
};

describe('catalog-operations', () => {
  beforeEach(() => {
    container.registerInstance(CatalogGateway, catalogGatewayMock as unknown as CatalogGateway);
    container.registerInstance(
      TokenSyncGateway,
      tokenSyncGatewayMock as unknown as TokenSyncGateway,
    );
    vi.mocked(catalogGatewayMock.createCatalog).mockResolvedValue({ name: 'c1', version: '1.0.0' } as Catalog);
    vi.mocked(catalogGatewayMock.saveCatalog).mockResolvedValue(undefined);
    vi.mocked(catalogGatewayMock.loadCatalog).mockResolvedValue({ name: 'c1', version: '1.0.0' } as Catalog);
    vi.mocked(catalogGatewayMock.listCatalogs).mockResolvedValue([{ name: 'c1', version: '1.0.0' }]);
    vi.mocked(catalogGatewayMock.deleteCatalog).mockResolvedValue(undefined);
    vi.mocked(tokenSyncGatewayMock.sync).mockResolvedValue({
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('createCatalog calls catalogGateway.createCatalog and returns catalog', async () => {
    const setState = vi.fn();
    const result = await createCatalog(setState, { name: 'c1', type: 'manual' });

    expect(catalogGatewayMock.createCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.createCatalog).toHaveBeenCalledWith({ name: 'c1', type: 'manual' });
    expect(result).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('LoadCatalogRefs.execute sets store entries from listCatalogs result', async () => {
    const setStoreState = vi.fn();
    const op = new LoadCatalogRefs(
      new StoreStateSetter(setStoreState),
      container.resolve(CatalogGateway),
    );

    await op.execute();

    expect(catalogGatewayMock.listCatalogs).toHaveBeenCalledTimes(1);
    expect(setStoreState).toHaveBeenCalledWith({
      type: 'SET_STORE_CATALOG_ENTRIES',
      entries: [{ name: 'c1', version: '1.0.0', isLoaded: false, catalog: undefined }],
    });
  });

  it('loadCatalog loads a catalog and updates state', async () => {
    const setState = vi.fn();

    const loaded = await loadCatalog(setState, 'c1', '1.0.0');

    expect(catalogGatewayMock.loadCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.loadCatalog).toHaveBeenCalledWith('c1', '1.0.0');
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_CATALOG',
      catalog: { name: 'c1', version: '1.0.0' },
    });
    expect(loaded).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('saveCatalog calls catalogGateway.saveCatalog', async () => {
    const catalog = { name: 'c1', version: '1.0.0' } as Catalog;

    await saveCatalog(catalog);

    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledWith(catalog);
  });

  it('deleteCatalog calls catalogGateway.deleteCatalog', async () => {
    await deleteCatalog('c1', '1.0.0');

    expect(catalogGatewayMock.deleteCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.deleteCatalog).toHaveBeenCalledWith('c1', '1.0.0');
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

    expect(tokenSyncGatewayMock.sync).toHaveBeenCalledTimes(1);
    expect(tokenSyncGatewayMock.sync).toHaveBeenCalledWith(catalog.sources);
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

    expect(tokenSyncGatewayMock.sync).toHaveBeenCalledTimes(1);
    expect(result.version).toBe('1.0.1');
    expect(result.locked).toBe(true);
  });
});

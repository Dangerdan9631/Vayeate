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
import { AppStateSetter } from '../../state/app-state-setter';

const catalogGatewayMock = {
  saveCatalog: vi.fn(),
  loadCatalog: vi.fn(),
  listCatalogs: vi.fn(),
  deleteCatalog: vi.fn(),
};

const tokenSyncGatewayMock = {
  sync: vi.fn(),
};

describe('catalog-operations', () => {
  let setState: ReturnType<typeof vi.fn>;
  let setStoreState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setState = vi.fn();
    setStoreState = vi.fn();
    container.registerInstance(AppStateSetter, new AppStateSetter(setState));
    container.registerInstance(StoreStateSetter, new StoreStateSetter(setStoreState));
    container.registerInstance(CatalogGateway, catalogGatewayMock as unknown as CatalogGateway);
    container.registerInstance(
      TokenSyncGateway,
      tokenSyncGatewayMock as unknown as TokenSyncGateway,
    );
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
    container.clearInstances();
  });

  it('createCatalog persists new catalog, updates store, and returns ref', async () => {
    const result = await createCatalog(setState, { name: 'c1', type: 'manual' });

    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'c1', version: '1.0.0', type: 'manual' }),
    );
    expect(setStoreState).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_STORE_CATALOG_ENTRY',
        name: 'c1',
        version: '1.0.0',
        isLoaded: true,
      }),
    );
    expect(setState.mock.calls.some((c) => c[0]?.type === 'SET_IS_CREATING')).toBe(true);
    expect(result).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('LoadCatalogRefs.execute sets store entries from listCatalogs result', async () => {
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

  it('loadCatalog loads a catalog from disk without updating app state', async () => {
    const noopSetState = vi.fn();

    const loaded = await loadCatalog(noopSetState, 'c1', '1.0.0');

    expect(catalogGatewayMock.loadCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.loadCatalog).toHaveBeenCalledWith('c1', '1.0.0');
    expect(noopSetState).not.toHaveBeenCalled();
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

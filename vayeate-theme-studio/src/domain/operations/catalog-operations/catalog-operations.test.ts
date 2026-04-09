import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import type { Catalog } from '../../../model/schemas';
import { CatalogGateway } from '../../../gateway/catalog/catalog-gateway';
import { TokenSyncGateway } from '../../../gateway/catalog/token-sync-gateway';
import {
  CreateCatalogOperation,
  DeleteCatalogOperation,
  LoadCatalogOperation,
  LoadCatalogRefsOperation,
  SaveCatalogOperation,
  SyncCatalogOperation,
} from '.';
import { CatalogsStateSetter } from '../../state/catalog/catalogs-state-reducer';

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

  beforeEach(() => {
    setState = vi.fn();
    container.registerInstance(CatalogsStateSetter, new CatalogsStateSetter(setState));
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

  it('CreateCatalogOperation persists new catalog, updates store, and returns ref', async () => {
    const result = await container.resolve(CreateCatalogOperation).execute({ name: 'c1', type: 'manual' });

    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'c1', version: '1.0.0', type: 'manual' }),
    );
    expect(setState).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_CATALOG_MAP_ENTRY',
        name: 'c1',
        version: '1.0.0',
        isLoaded: true,
      }),
    );
    expect(setState.mock.calls.some((c) => c[0]?.type === 'SET_IS_CREATING')).toBe(true);
    expect(result).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('LoadCatalogRefsOperation.execute sets store entries from listCatalogs result', async () => {
    const op = new LoadCatalogRefsOperation(
      new CatalogsStateSetter(setState),
      container.resolve(CatalogGateway),
    );

    await op.execute();

    expect(catalogGatewayMock.listCatalogs).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledWith({
      type: 'SET_CATALOG_MAP_ENTRIES',
      entries: [{ name: 'c1', version: '1.0.0', isLoaded: false, catalog: undefined }],
    });
  });

  it('LoadCatalogOperation loads a catalog from disk without updating app state', async () => {
    const loaded = await container.resolve(LoadCatalogOperation).execute('c1', '1.0.0');

    expect(catalogGatewayMock.loadCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.loadCatalog).toHaveBeenCalledWith('c1', '1.0.0');
    expect(setState).not.toHaveBeenCalled();
    expect(loaded).toEqual({ name: 'c1', version: '1.0.0' });
  });

  it('SaveCatalogOperation calls catalogGateway.saveCatalog', async () => {
    const catalog = { name: 'c1', version: '1.0.0' } as Catalog;

    await container.resolve(SaveCatalogOperation).execute(catalog);

    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.saveCatalog).toHaveBeenCalledWith(catalog);
  });

  it('DeleteCatalogOperation calls catalogGateway.deleteCatalog', async () => {
    await container.resolve(DeleteCatalogOperation).execute('c1', '1.0.0');

    expect(catalogGatewayMock.deleteCatalog).toHaveBeenCalledTimes(1);
    expect(catalogGatewayMock.deleteCatalog).toHaveBeenCalledWith('c1', '1.0.0');
  });

  it('SyncCatalogOperation preserves version when catalog is unlocked', async () => {
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

    const result = await container.resolve(SyncCatalogOperation).execute(catalog);

    expect(tokenSyncGatewayMock.sync).toHaveBeenCalledTimes(1);
    expect(tokenSyncGatewayMock.sync).toHaveBeenCalledWith(catalog.sources);
    expect(result.version).toBe('1.0.0');
    expect(result.locked).toBe(true);
  });

  it('SyncCatalogOperation bumps patch version when catalog is locked', async () => {
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

    const result = await container.resolve(SyncCatalogOperation).execute(catalog);

    expect(tokenSyncGatewayMock.sync).toHaveBeenCalledTimes(1);
    expect(result.version).toBe('1.0.1');
    expect(result.locked).toBe(true);
  });
});

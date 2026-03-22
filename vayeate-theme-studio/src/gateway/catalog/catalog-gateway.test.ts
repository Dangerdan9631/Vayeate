import { describe, it, expect, vi, afterEach } from 'vitest';
import { createCatalogWithParams } from '../../model/factories';
import { CatalogGateway } from './catalog-gateway';
import type { FileSystemService } from '../services/file-system-service';

afterEach(() => {
  vi.restoreAllMocks();
});

function createFsMock(partial: Partial<FileSystemService> = {}): FileSystemService {
  return {
    createFile: vi.fn().mockResolvedValue(undefined),
    saveFile: vi.fn().mockResolvedValue(undefined),
    loadFile: vi.fn().mockResolvedValue(null),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    listFiles: vi.fn().mockResolvedValue([]),
    ...partial,
  } as unknown as FileSystemService;
}

describe('CatalogGateway', () => {
  it('saveCatalog writes JSON under data/catalogs with expected filename', async () => {
    const saveFile = vi.fn().mockResolvedValue(undefined);
    const gw = new CatalogGateway(createFsMock({ saveFile }));
    const catalog = createCatalogWithParams({ name: 'dotnet', type: 'manual' });
    await gw.saveCatalog(catalog);
    expect(saveFile).toHaveBeenCalledTimes(1);
    expect(saveFile.mock.calls[0][0]).toBe('data/catalogs/dotnet-1.0.0.json');
    expect(saveFile.mock.calls[0][1]).toContain('"name": "dotnet"');
  });

  it('loadCatalog returns parsed catalog when file is valid JSON', async () => {
    const stored = createCatalogWithParams({ name: 'bar', type: 'manual' });
    const loadFile = vi.fn().mockResolvedValue(JSON.stringify(stored));
    const gw = new CatalogGateway(createFsMock({ loadFile }));
    const loaded = await gw.loadCatalog('bar', '1.0.0');
    expect(loadFile).toHaveBeenCalledWith('data/catalogs/bar-1.0.0.json');
    expect(loaded).toEqual(stored);
  });

  it('loadCatalog returns null when loadFile returns null', async () => {
    const loadFile = vi.fn().mockResolvedValue(null);
    const gw = new CatalogGateway(createFsMock({ loadFile }));
    await expect(gw.loadCatalog('x', '1.0.0')).resolves.toBeNull();
  });

  it('loadCatalog returns null on invalid JSON', async () => {
    const loadFile = vi.fn().mockResolvedValue('not json');
    const gw = new CatalogGateway(createFsMock({ loadFile }));
    await expect(gw.loadCatalog('x', '1.0.0')).resolves.toBeNull();
  });

  it('listCatalogs maps filenames via parseFileName and returns refs', async () => {
    const listFiles = vi.fn().mockResolvedValue(['dotnet-csharp-1.0.0.json', 'ignore.txt']);
    const gw = new CatalogGateway(createFsMock({ listFiles }));
    const refs = await gw.listCatalogs();
    expect(listFiles).toHaveBeenCalledWith('data/catalogs');
    expect(refs).toContainEqual({ name: 'dotnet-csharp', version: '1.0.0' });
    expect(refs).toHaveLength(1);
  });

  it('listCatalogs returns empty array when listFiles throws', async () => {
    const listFiles = vi.fn().mockRejectedValue(new Error('no dir'));
    const gw = new CatalogGateway(createFsMock({ listFiles }));
    await expect(gw.listCatalogs()).resolves.toEqual([]);
  });

  it('deleteCatalog swallows deleteFile errors', async () => {
    const deleteFile = vi.fn().mockRejectedValue(new Error('ENOENT'));
    const gw = new CatalogGateway(createFsMock({ deleteFile }));
    await expect(gw.deleteCatalog('n', '1.0.0')).resolves.toBeUndefined();
    expect(deleteFile).toHaveBeenCalledWith('data/catalogs/n-1.0.0.json');
  });
});

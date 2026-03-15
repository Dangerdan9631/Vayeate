/**
 * @vitest-environment node
 */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCatalogRepository } from './catalog-repository';
import type { Catalog } from '../../model/schemas';

describe('createCatalogRepository', () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = mkdtempSync(join(tmpdir(), 'catalog-repo-test-'));
  });

  afterEach(() => {
    rmSync(baseDir, { recursive: true, force: true });
  });

  const validCatalog: Catalog = {
    name: 'my-catalog',
    version: '1.0.0',
    type: 'manual',
    locked: false,
    sources: [],
    tokens: [],
    semanticTokenTypes: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };

  it('saves and loads a catalog round-trip', async () => {
    const repo = createCatalogRepository(baseDir);
    await repo.saveCatalog(validCatalog);
    const loaded = await repo.loadCatalog('my-catalog', '1.0.0');
    expect(loaded).toEqual({
      ...validCatalog,
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
  });

  it('listCatalogs returns saved catalog references', async () => {
    const repo = createCatalogRepository(baseDir);
    await repo.saveCatalog(validCatalog);
    const list = await repo.listCatalogs();
    expect(list).toContainEqual({ name: 'my-catalog', version: '1.0.0' });
  });

  it('loadCatalog returns null for missing file', async () => {
    const repo = createCatalogRepository(baseDir);
    const loaded = await repo.loadCatalog('missing', '1.0.0');
    expect(loaded).toBeNull();
  });

  it('saveCatalog throws for invalid catalog', async () => {
    const repo = createCatalogRepository(baseDir);
    const invalid = { ...validCatalog, name: 'invalid name!' } as Catalog;
    await expect(repo.saveCatalog(invalid)).rejects.toThrow(/Invalid catalog/);
  });
});

import { vi } from 'vitest';
import { catalogSchema } from '../../../model/schemas';
import {
  createCatalogWithParams,
  loadCatalogsForDisplay,
  loadCatalogPage,
} from '.';
import * as catalogListController from './catalog-list/loadCatalogRefs';
import * as undoOperations from '../../operations/undo-operations';
const loadCatalogForDisplayMock = vi.hoisted(() => vi.fn().mockResolvedValue(null));

vi.mock('../../operations/catalog-operations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../operations/catalog-operations')>();
  return {
    ...actual,
    loadCatalogForDisplay: loadCatalogForDisplayMock,
  };
});

describe('createCatalogWithParams', () => {
  it('returns an object that satisfies catalog schema', () => {
    const catalog = createCatalogWithParams({ name: 'test', type: 'manual' });
    const result = catalogSchema.safeParse(catalog);
    expect(result.success).toBe(true);
  });

  it('returns catalog with the given name and type', () => {
    const catalog = createCatalogWithParams({ name: 'my-catalog', type: 'remote' });
    expect(catalog.name).toBe('my-catalog');
    expect(catalog.version).toBe('1.0.0');
    expect(catalog.type).toBe('remote');
    expect(catalog.locked).toBe(false);
    expect(catalog.sources).toEqual([]);
    expect(catalog.tokens).toEqual([]);
  });

  it('defaults version to 1.0.0 and locked to false', () => {
    const catalog = createCatalogWithParams({ name: 'foo', type: 'manual' });
    expect(catalog.version).toBe('1.0.0');
    expect(catalog.locked).toBe(false);
  });
});

describe('loadCatalogsForDisplay', () => {
  const setState = vi.fn();

  beforeEach(() => {
    loadCatalogForDisplayMock.mockClear();
  });

  it('calls loadCatalogForDisplay op for each ref', async () => {
    const refs = [
      { name: 'cat-a', version: '1.0.0' },
      { name: 'cat-b', version: '1.0.1' },
    ];
    await loadCatalogsForDisplay(setState, refs);
    expect(loadCatalogForDisplayMock).toHaveBeenCalledTimes(2);
    expect(loadCatalogForDisplayMock).toHaveBeenNthCalledWith(1, setState, 'cat-a', '1.0.0');
    expect(loadCatalogForDisplayMock).toHaveBeenNthCalledWith(2, setState, 'cat-b', '1.0.1');
  });

  it('does not call loadCatalogForDisplay when refs is empty', async () => {
    await loadCatalogsForDisplay(setState, []);
    expect(loadCatalogForDisplayMock).not.toHaveBeenCalled();
  });

  it('calls loadCatalogForDisplay once for a single ref', async () => {
    await loadCatalogsForDisplay(setState, [{ name: 'only', version: '2.0.0' }]);
    expect(loadCatalogForDisplayMock).toHaveBeenCalledTimes(1);
    expect(loadCatalogForDisplayMock).toHaveBeenCalledWith(setState, 'only', '2.0.0');
  });
});

describe('loadCatalogPage', () => {
  it('loads catalog refs then resets current undo stack id', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const loadRefsSpy = vi
      .spyOn(catalogListController, 'loadCatalogRefs')
      .mockResolvedValue(undefined);
    const setUndoSpy = vi
      .spyOn(undoOperations, 'setCurrentUndoStackId')
      .mockImplementation(() => {});

    await loadCatalogPage(setState, setStoreState);

    expect(loadRefsSpy).toHaveBeenCalledWith(setState, setStoreState);
    expect(setUndoSpy).toHaveBeenCalledWith(setState, null);
    expect(loadRefsSpy.mock.invocationCallOrder[0]).toBeLessThan(
      setUndoSpy.mock.invocationCallOrder[0],
    );
  });
});

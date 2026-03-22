import { vi } from 'vitest';
import { catalogSchema } from '../../../model/schemas';
import { createCatalogWithParams } from '../../../model/factories';
import { LoadCatalogPageController } from '.';

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

describe('LoadCatalogPageController', () => {
  it('resets current undo stack id (catalog refs live in store after app load)', async () => {
    const setUndoMock = { execute: vi.fn() };

    const controller = new LoadCatalogPageController(setUndoMock as any);

    await controller.run();

    expect(setUndoMock.execute).toHaveBeenCalledTimes(1);
    expect(setUndoMock.execute).toHaveBeenCalledWith(null);
  });
});

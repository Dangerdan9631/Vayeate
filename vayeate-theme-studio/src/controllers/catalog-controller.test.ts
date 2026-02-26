import { catalogSchema } from '../model/schemas';
import { createCatalog } from './catalog-controller';

describe('createCatalog', () => {
  it('returns an object that satisfies catalog schema', () => {
    const catalog = createCatalog();
    const result = catalogSchema.safeParse(catalog);
    expect(result.success).toBe(true);
  });

  it('returns placeholder catalog with expected structure', () => {
    const catalog = createCatalog();
    expect(catalog.name).toBe('new-catalog');
    expect(catalog.version).toBe('1.0.0');
    expect(catalog.type).toBe('manual');
    expect(catalog.locked).toBe(false);
    expect(catalog.sources).toEqual([]);
    expect(catalog.tokens).toEqual([]);
  });
});

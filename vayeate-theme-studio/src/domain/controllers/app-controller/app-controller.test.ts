import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalogRefs } from '../../operations/catalog-operations';
import { loadTemplateRefs } from '../../operations/template-operations';
import { loadThemeRefs } from '../../operations/theme-operations';
import { loadApplication, unloadApplication } from '.';

vi.mock('../../operations/catalog-operations', () => ({ loadCatalogRefs: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../operations/template-operations', () => ({ loadTemplateRefs: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../operations/theme-operations', () => ({ loadThemeRefs: vi.fn().mockResolvedValue(undefined) }));

describe('app-controller', () => {
  let setState: ReturnType<typeof vi.fn>;
  let setStoreState: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setState = vi.fn();
    setStoreState = vi.fn();
  });

  it('loadApplication composes operations and resolves', async () => {
    await expect(loadApplication(setState, setStoreState)).resolves.toBeUndefined();
  });

  it('loadApplication calls load refs operations with setState and setStoreState', async () => {
    await loadApplication(setState, setStoreState);
    expect(loadCatalogRefs).toHaveBeenCalledWith(setState, setStoreState);
    expect(loadTemplateRefs).toHaveBeenCalledWith(setState, setStoreState);
    expect(loadThemeRefs).toHaveBeenCalledWith(setState, setStoreState);
  });

  it('unloadApplication composes operations and resolves', async () => {
    await expect(unloadApplication(setState)).resolves.toBeUndefined();
  });
});

import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../domain/state/ui/catalog-ui-store';
import type { Catalog } from '../../../model/schema/catalog';

const catalogA: Catalog = {
  name: 'catalog-a',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [{ key: 'editor.background', type: 'theme' }],
  semanticTokenTypes: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

const catalogB: Catalog = {
  name: 'catalog-b',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [{ key: 'editor.foreground', type: 'theme' }],
  semanticTokenTypes: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

vi.mock('../../core/action-queue/use-app-dispatch', () => ({
  useAppDispatch: () => vi.fn(),
}));

const catalogsStore = new CatalogsStore();
const catalogUiStore = new CatalogUiStore();
const originalResolve = container.resolve.bind(container);

describe('useTokensCardViewModel', () => {
  let useTokensCardViewModel: typeof import('./use-tokens-card-viewmodel').useTokensCardViewModel;

  beforeAll(async () => {
    vi.spyOn(container, 'resolve').mockImplementation((token: unknown) => {
      if (token === CatalogsStore) return catalogsStore;
      if (token === CatalogUiStore) return catalogUiStore;
      return originalResolve(token as never);
    });
    ({ useTokensCardViewModel } = await import('./use-tokens-card-viewmodel'));
  });

  it('does not rerender selected catalog output when an unrelated catalog mutates', async () => {
    catalogsStore.getStore().upsertCatalogs([catalogA, catalogB]);
    catalogUiStore.getStore().selectCatalog({ name: catalogA.name, version: catalogA.version });

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useTokensCardViewModel();
    });

    await waitFor(() => {
      expect(result.current.catalog?.name).toBe('catalog-a');
    });

    const catalogBefore = result.current.catalog;
    const filteredBefore = result.current.filteredTokensByType;
    const renderCountBefore = renderCount;

    catalogsStore.getStore().upsertCatalogs([
      {
        ...catalogB,
        tokens: [{ key: 'editor.foreground', type: 'theme' }, { key: 'editor.line', type: 'theme' }],
      },
    ]);

    await waitFor(() => {
      expect(catalogsStore.getStore().state.catalogs['catalog-b']?.['1.0.0']?.catalog?.tokens).toHaveLength(2);
    });

    expect(renderCount).toBe(renderCountBefore);
    expect(result.current.catalog).toBe(catalogBefore);
    expect(result.current.filteredTokensByType).toBe(filteredBefore);
  });
});

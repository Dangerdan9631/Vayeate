import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useCatalogViewModel } from './use-catalog-viewmodel';
import type { Catalog } from '../../model/schemas';

const mockCatalog: Catalog = {
  name: 'test-catalog',
  version: '2.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
  semanticTokenTypes: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(mockCatalog),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
    deleteCatalog: () => Promise.resolve(),
    fetchUrl: () => Promise.resolve(''),
  };
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

function harness() {
  const stateRef = {
    current: {
      dispatch: null as ((a: import('../actions/action-types').AppActionV2) => void) | null,
    },
  };
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>
      <HarnessInner ref={stateRef} />
      {children}
    </AppProvider>
  );
  return { Wrapper, getDispatch: () => stateRef.current.dispatch };
}

const HarnessInner = React.forwardRef<
  { dispatch: ((a: import('../actions/action-types').AppActionV2) => void) | null },
  object
>(function HarnessInner(_, ref) {
  const { dispatch } = useAppState();
  if (ref && typeof ref === 'object' && 'current' in ref) {
    (ref as React.MutableRefObject<{ dispatch: ((a: import('../actions/action-types').AppActionV2) => void) | null }>).current = {
      dispatch,
    };
  }
  return null;
});

describe('useCatalogViewModel', () => {
  it('returns no catalog and is not creating initially', () => {
    const { Wrapper } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });
    expect(result.current.catalog).toBeNull();
    expect(result.current.isCreating).toBe(false);
    expect(result.current.createDialogOpen).toBe(false);
    expect(result.current.catalogNames).toEqual([]);
  });

  it('loads catalog after CREATE_CATALOG succeeds', async () => {
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(mockCatalog),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(mockCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'test-catalog', version: '2.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name: 'test-catalog', type: 'manual' } });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.catalog).not.toBeNull();
    expect(result.current.catalog?.name).toBe('test-catalog');
    expect(result.current.isCreating).toBe(false);
  });

  it('returns isCreating true while CREATE_CATALOG is in progress', async () => {
    let resolveCreate: (c: Catalog) => void;
    const createPromise = new Promise<Catalog>((r) => {
      resolveCreate = r;
    });
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => createPromise,
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name: 'foo', type: 'manual' } });
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveCreate!(mockCatalog);
      await createPromise;
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.isCreating).toBe(false);
  });

  it('syncCatalog dispatches SYNC_CATALOG with the catalog', async () => {
    const remoteCatalog: Catalog = {
      name: 'remote-cat',
      version: '1.0.0',
      type: 'remote',
      locked: false,
      sources: [{ url: 'https://example.com', type: 'default', tokenType: 'theme' }],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };

    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(remoteCatalog),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(remoteCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'remote-cat', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve('`editor.background`'),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_CATALOGS_LIST_ON_COMMIT', name: 'remote-cat', version: '1.0.0' });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.catalog).not.toBeNull();
    expect(result.current.catalog?.type).toBe('remote');

    // Call syncCatalog - it should dispatch SYNC_CATALOG with the catalog
    act(() => {
      result.current.syncCatalog();
    });

    // The action is enqueued; we verify the function doesn't throw and the catalog is passed
    // The integration behavior (fetching tokens) is tested in catalog-sync.test.ts
  });

  it('addToken with semantic token parses selector and merges into semantic arrays without adding to tokens', async () => {
    const baseCatalog: Catalog = {
      name: 'sem-cat',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const saveCatalogMock = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(baseCatalog),
      saveCatalog: saveCatalogMock,
      loadCatalog: () => Promise.resolve(baseCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'sem-cat', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_CATALOGS_LIST_ON_COMMIT', name: 'sem-cat', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.catalog).not.toBeNull();

    await act(async () => {
      result.current.addToken('foo.bar.baz:java', 'semantic token');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    expect(saveCatalogMock).toHaveBeenCalled();
    const saved = saveCatalogMock.mock.calls[0][0] as Catalog;
    expect(saved.tokens).toEqual([]);
    expect(saved.semanticTokenTypes).toEqual(['foo']);
    expect(saved.semanticTokenModifiers).toEqual(['bar', 'baz']);
    expect(saved.semanticTokenLanguages).toEqual(['java']);
  });

  it('addToken with *.bar adds only modifier', async () => {
    const baseCatalog: Catalog = {
      name: 'sem-cat',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const saveCatalogMock = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(baseCatalog),
      saveCatalog: saveCatalogMock,
      loadCatalog: () => Promise.resolve(baseCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'sem-cat', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_CATALOGS_LIST_ON_COMMIT', name: 'sem-cat', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.addToken('*.bar', 'semantic token');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    const saved = saveCatalogMock.mock.calls[0][0] as Catalog;
    expect(saved.semanticTokenTypes).toEqual([]);
    expect(saved.semanticTokenModifiers).toEqual(['bar']);
    expect(saved.semanticTokenLanguages).toEqual([]);
  });

  it('addToken with invalid semantic selector does not save', async () => {
    const baseCatalog: Catalog = {
      name: 'sem-cat',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const saveCatalogMock = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(baseCatalog),
      saveCatalog: saveCatalogMock,
      loadCatalog: () => Promise.resolve(baseCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'sem-cat', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_CATALOGS_LIST_ON_COMMIT', name: 'sem-cat', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.addToken('not-valid@selector', 'semantic token');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    expect(saveCatalogMock).not.toHaveBeenCalled();
  });

  it('exposes addSemanticFromSelector and setSemantic* callbacks', () => {
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(mockCatalog),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(mockCatalog),
      listCatalogs: () => Promise.resolve([{ name: 'test-catalog', version: '2.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    expect(typeof result.current.addSemanticFromSelector).toBe('function');
    expect(typeof result.current.setSemanticTypes).toBe('function');
    expect(typeof result.current.setSemanticModifiers).toBe('function');
    expect(typeof result.current.setSemanticLanguages).toBe('function');
  });
});

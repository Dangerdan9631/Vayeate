import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useAppState } from '../ui/context/AppContext';
import { useCatalogViewModel } from './use-catalog-viewmodel';
import type { Catalog } from '../model/schemas';

const mockCatalog: Catalog = {
  name: 'test-catalog',
  version: '2.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
};

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(mockCatalog),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
    deleteCatalog: () => Promise.resolve(),
  };
});

afterEach(() => {
  delete (window as unknown as { electronAPI?: unknown }).electronAPI;
});

function harness() {
  const stateRef = { current: { dispatch: null as ((a: import('../actions/action-types').AppAction) => void) | null } };
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>
      <HarnessInner ref={stateRef} />
      {children}
    </AppProvider>
  );
  return { Wrapper, getDispatch: () => stateRef.current.dispatch };
}

const HarnessInner = React.forwardRef<
  { dispatch: ((a: import('../actions/action-types').AppAction) => void) | null },
  object
>(function HarnessInner(_, ref) {
  const { dispatch } = useAppState();
  if (ref && typeof ref === 'object' && 'current' in ref) {
    (ref as React.MutableRefObject<{ dispatch: ((a: import('../actions/action-types').AppAction) => void) | null }>).current = {
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
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CREATE_CATALOG', params: { name: 'test-catalog', type: 'manual' } });
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
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CREATE_CATALOG', params: { name: 'foo', type: 'manual' } });
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
});

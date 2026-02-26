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
  it('returns hasCatalog false and catalogJson null initially', () => {
    const { Wrapper } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });
    expect(result.current.hasCatalog).toBe(false);
    expect(result.current.catalogJson).toBeNull();
    expect(result.current.isCreating).toBe(false);
  });

  it('returns catalogJson and hasCatalog true after CREATE_CATALOG succeeds', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CREATE_CATALOG' });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.hasCatalog).toBe(true);
    expect(result.current.catalogJson).toContain('"name": "test-catalog"');
    expect(result.current.isCreating).toBe(false);
  });

  it('returns isCreating true while CREATE_CATALOG is in progress', async () => {
    let resolveCreate: (c: Catalog) => void;
    const createPromise = new Promise<Catalog>((r) => {
      resolveCreate = r;
    });
    (window as unknown as { electronAPI?: { createCatalog: () => Promise<Catalog> } }).electronAPI = {
      ...((window as unknown as { electronAPI?: object }).electronAPI as object),
      createCatalog: () => createPromise,
    } as { createCatalog: () => Promise<Catalog> };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CREATE_CATALOG' });
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveCreate!(mockCatalog);
      await createPromise;
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    expect(result.current.isCreating).toBe(false);
  });
});

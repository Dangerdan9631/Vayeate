import React, { useEffect, useRef } from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useCatalogViewModel } from './use-catalog-viewmodel';
import type { Catalog } from '../../model/schemas';
import { createInMemoryFsElectronApi, seedCatalogFile } from '../../test-utils/electron-api-in-memory-fs';
import { electronPreloadStubs } from '../../test-utils/electron-stubs';
import {  CatalogActionType } from '../actions/action-types';

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
  const api = createInMemoryFsElectronApi();
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    ...electronPreloadStubs(),
    ...api,
    fetchUrl: () => Promise.resolve(''),
  };
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
  const appOnLoadDispatched = useRef(false);

  useEffect(() => {
    if (!dispatch || appOnLoadDispatched.current) return;
    appOnLoadDispatched.current = true;
    
  }, [dispatch]);

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
    const api = createInMemoryFsElectronApi();
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogCreateDialogNameTextOnChange, value: 'test-catalog' });
      await getDispatch()?.({ type: CatalogActionType.CatalogCreateDialogOkButtonOnClick });
    });

    expect(result.current.catalog).not.toBeNull();
    expect(result.current.catalog?.name).toBe('test-catalog');
    expect(result.current.catalog?.version).toBe('1.0.0');
    expect(result.current.isCreating).toBe(false);
  });

  it('returns isCreating true while CREATE_CATALOG is in progress', async () => {
    let resolveSave: () => void;
    const savePromise = new Promise<void>((r) => {
      resolveSave = r;
    });
    const api = createInMemoryFsElectronApi({
      fsSaveFile: () => savePromise,
    });
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogCreateDialogNameTextOnChange, value: 'foo' });
      getDispatch()?.({ type: CatalogActionType.CatalogCreateDialogOkButtonOnClick });
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveSave!();
      await savePromise;
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

    const api = createInMemoryFsElectronApi();
    seedCatalogFile(api.files, remoteCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
      fetchUrl: () => Promise.resolve('`editor.background`'),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: 'remote-cat', version: '1.0.0' });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.catalog).not.toBeNull();
    expect(result.current.catalog?.type).toBe('remote');

    act(() => {
      result.current.syncCatalog();
    });
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
    const api = createInMemoryFsElectronApi();
    const fsSaveFile = vi.fn(async (_path: string, contents: string) => {
      api.files.set(_path, contents);
    });
    api.fsSaveFile = fsSaveFile;
    seedCatalogFile(api.files, baseCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: 'sem-cat', version: '1.0.0' });
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

    expect(fsSaveFile).toHaveBeenCalled();
    const saved = JSON.parse(fsSaveFile.mock.calls[0][1] as string) as Catalog;
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
    const api = createInMemoryFsElectronApi();
    const fsSaveFile = vi.fn(async (_path: string, contents: string) => {
      api.files.set(_path, contents);
    });
    api.fsSaveFile = fsSaveFile;
    seedCatalogFile(api.files, baseCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: 'sem-cat', version: '1.0.0' });
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

    const saved = JSON.parse(fsSaveFile.mock.calls[0][1] as string) as Catalog;
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
    const fsSaveFile = vi.fn().mockResolvedValue(undefined);
    const api = createInMemoryFsElectronApi({ fsSaveFile });
    seedCatalogFile(api.files, baseCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useCatalogViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: 'sem-cat', version: '1.0.0' });
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

    expect(fsSaveFile).not.toHaveBeenCalled();
  });

  it('exposes addSemanticFromSelector and setSemantic* callbacks', () => {
    const api = createInMemoryFsElectronApi();
    seedCatalogFile(api.files, mockCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...electronPreloadStubs(),
      ...api,
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

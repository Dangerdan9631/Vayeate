import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useTemplateViewModel, computeOrphanKeys } from './use-template-viewmodel';
import type { Template, Mapping, Token } from '../model/schemas';

const mockTemplate: Template = {
  name: 'test-template',
  version: '1.0.0',
  locked: false,
  catalogRefs: [],
  mappings: [],
  colorVariables: [],
  contrastVariables: [],
};

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(null),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
    deleteCatalog: () => Promise.resolve(),
    createTemplate: () => Promise.resolve(mockTemplate),
    saveTemplate: () => Promise.resolve(),
    loadTemplate: () => Promise.resolve(null),
    listTemplates: () => Promise.resolve([]),
    deleteTemplate: () => Promise.resolve(),
    fetchUrl: () => Promise.resolve(''),
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

describe('useTemplateViewModel', () => {
  it('returns no template and is not creating initially', () => {
    const { Wrapper } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });
    expect(result.current.template).toBeNull();
    expect(result.current.isCreating).toBe(false);
    expect(result.current.createDialogOpen).toBe(false);
    expect(result.current.templateNames).toEqual([]);
  });

  it('loads template after CREATE_TEMPLATE succeeds', async () => {
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: () => Promise.resolve(mockTemplate),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CREATE_TEMPLATE', params: { name: 'test-template' } });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template).not.toBeNull();
    expect(result.current.template?.name).toBe('test-template');
    expect(result.current.isCreating).toBe(false);
  });
});

describe('computeOrphanKeys', () => {
  it('returns empty set when all mappings have matching catalog tokens', () => {
    const tokens: Token[] = [
      { key: 'editor.background', type: 'theme' },
      { key: 'comment', type: 'token' },
    ];
    const mappings: Mapping[] = [
      { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null },
      { token: { key: 'comment', type: 'token' }, colorVariableRef: null, contrastVariableRef: null },
    ];
    expect(computeOrphanKeys(mappings, tokens).size).toBe(0);
  });

  it('returns orphan keys for mappings without matching catalog tokens', () => {
    const tokens: Token[] = [
      { key: 'editor.background', type: 'theme' },
    ];
    const mappings: Mapping[] = [
      { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null },
      { token: { key: 'removed-token', type: 'token' }, colorVariableRef: null, contrastVariableRef: null },
    ];
    const orphans = computeOrphanKeys(mappings, tokens);
    expect(orphans.size).toBe(1);
    expect(orphans.has('token::removed-token')).toBe(true);
  });

  it('returns all mappings as orphans when catalog is empty', () => {
    const mappings: Mapping[] = [
      { token: { key: 'foo', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null },
    ];
    const orphans = computeOrphanKeys(mappings, []);
    expect(orphans.size).toBe(1);
  });
});

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
  groups: [],
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
      { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
      { token: { key: 'comment', type: 'token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    expect(computeOrphanKeys(mappings, tokens).size).toBe(0);
  });

  it('returns orphan keys for mappings without matching catalog tokens', () => {
    const tokens: Token[] = [
      { key: 'editor.background', type: 'theme' },
    ];
    const mappings: Mapping[] = [
      { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
      { token: { key: 'removed-token', type: 'token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    const orphans = computeOrphanKeys(mappings, tokens);
    expect(orphans.size).toBe(1);
    expect(orphans.has('token::removed-token')).toBe(true);
  });

  it('returns all mappings as orphans when catalog is empty', () => {
    const mappings: Mapping[] = [
      { token: { key: 'foo', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    const orphans = computeOrphanKeys(mappings, []);
    expect(orphans.size).toBe(1);
  });
});

describe('useTemplateViewModel groups', () => {
  it('addGroup adds group and save refreshes template', async () => {
    let savedTemplate: Template | null = null;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? mockTemplate),
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

    expect(result.current.template?.groups).toEqual([]);

    await act(async () => {
      result.current.addGroup('GroupA');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.groups).toContain('GroupA');
  });

  it('removeGroup does nothing when group has mappings', async () => {
    const templateWithGroupAndMapping: Template = {
      ...mockTemplate,
      groups: ['G1'],
      mappings: [
        {
          token: { key: 'editor.background', type: 'theme' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'G1',
        },
      ],
    };
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: () => Promise.resolve(templateWithGroupAndMapping),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'SELECT_TEMPLATE', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.removeGroup('G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current.template?.groups).toContain('G1');
  });

  it('removeGroup removes group when no mappings use it', async () => {
    const templateWithGroup: Template = {
      ...mockTemplate,
      groups: ['G1'],
      mappings: [],
    };
    let savedTemplate: Template | null = templateWithGroup;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithGroup),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'SELECT_TEMPLATE', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.groups).toContain('G1');

    await act(async () => {
      result.current.removeGroup('G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.groups).not.toContain('G1');
  });

  it('updateMappingGroupRef updates mapping group', async () => {
    const templateWithMapping: Template = {
      ...mockTemplate,
      groups: ['G1'],
      mappings: [
        {
          token: { key: 'editor.background', type: 'theme' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: null,
        },
      ],
    };
    let savedTemplate: Template | null = templateWithMapping;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithMapping),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'SELECT_TEMPLATE', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.mappings[0]?.groupRef).toBeNull();

    await act(async () => {
      result.current.updateMappingGroupRef('editor.background', 'theme', 'G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.mappings[0]?.groupRef).toBe('G1');
  });
});

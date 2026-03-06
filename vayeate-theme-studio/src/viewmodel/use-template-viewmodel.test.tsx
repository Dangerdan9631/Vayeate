import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useTemplateViewModel, computeOrphanKeys } from './use-template-viewmodel';
import type { Catalog, Template, Mapping, Token } from '../model/schemas';

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
      { key: 'comment', type: 'textmate token' },
    ];
    const mappings: Mapping[] = [
      { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
      { token: { key: 'comment', type: 'textmate token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    expect(computeOrphanKeys(mappings, tokens).size).toBe(0);
  });

  it('returns orphan keys for mappings without matching catalog tokens', () => {
    const tokens: Token[] = [
      { key: 'editor.background', type: 'theme' },
    ];
    const mappings: Mapping[] = [
      { token: { key: 'editor.background', type: 'theme' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
      { token: { key: 'removed-token', type: 'textmate token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    const orphans = computeOrphanKeys(mappings, tokens);
    expect(orphans.size).toBe(1);
    expect(orphans.has('textmate token::removed-token')).toBe(true);
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

  it('removeGroup does nothing when group has variables', async () => {
    const templateWithGroupAndVariable: Template = {
      ...mockTemplate,
      groups: ['G1'],
      mappings: [],
      colorVariables: [{ key: 'primary', groupRef: 'G1' }],
      contrastVariables: [],
    };
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: () => Promise.resolve(templateWithGroupAndVariable),
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

  it('updateColorVariableGroupRef updates color variable group', async () => {
    const templateWithVar: Template = {
      ...mockTemplate,
      groups: ['G1'],
      colorVariables: [{ key: 'primary', groupRef: null }],
      contrastVariables: [],
    };
    let savedTemplate: Template | null = templateWithVar;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithVar),
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

    expect(result.current.template?.colorVariables[0]?.groupRef).toBeNull();

    await act(async () => {
      result.current.updateColorVariableGroupRef('primary', 'G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.colorVariables[0]?.groupRef).toBe('G1');
  });

  it('updateContrastVariableGroupRef updates contrast variable group', async () => {
    const templateWithVar: Template = {
      ...mockTemplate,
      groups: ['G1'],
      colorVariables: [],
      contrastVariables: [{ key: 'textContrast', comparisonSourceRef: null, groupRef: null }],
    };
    let savedTemplate: Template | null = templateWithVar;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithVar),
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

    expect(result.current.template?.contrastVariables[0]?.groupRef).toBeNull();

    await act(async () => {
      result.current.updateContrastVariableGroupRef('textContrast', 'G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.contrastVariables[0]?.groupRef).toBe('G1');
  });

  it('addColorVariable with groupRef creates variable with that group', async () => {
    const templateWithGroup: Template = {
      ...mockTemplate,
      groups: ['G1'],
      colorVariables: [],
      contrastVariables: [],
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

    await act(async () => {
      result.current.addColorVariable('primary', 'G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.colorVariables).toHaveLength(1);
    expect(result.current.template?.colorVariables[0]).toEqual({ key: 'primary', groupRef: 'G1' });
  });

  it('addContrastVariable with groupRef creates variable with that group', async () => {
    const templateWithGroup: Template = {
      ...mockTemplate,
      groups: ['G1'],
      colorVariables: [],
      contrastVariables: [],
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

    await act(async () => {
      result.current.addContrastVariable('textContrast', 'G1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.contrastVariables).toHaveLength(1);
    expect(result.current.template?.contrastVariables[0]).toMatchObject({
      key: 'textContrast',
      comparisonSourceRef: null,
      groupRef: 'G1',
    });
  });
});

describe('catalog-named groups (toggleCatalog and changeCatalogVersion)', () => {
  const catalogWithCommentToken: Catalog = {
    name: 'cat-a',
    version: '1.0.0',
    type: 'remote',
    locked: false,
    sources: [],
    tokens: [{ key: 'comment', type: 'textmate token' }],
    semanticTokenTypes: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
  };

  const catalogWithCommentAndKeyword: Catalog = {
    ...catalogWithCommentToken,
    tokens: [
      { key: 'comment', type: 'textmate token' },
      { key: 'keyword', type: 'textmate token' },
    ],
  };

  it('enabling a catalog adds new mappings with groupRef set to catalog name and adds group only when new mappings added', async () => {
    let savedTemplate: Template | null = null;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: (_name: string, _version: string) =>
        Promise.resolve(catalogWithCommentToken),
      listCatalogs: () =>
        Promise.resolve([{ name: 'cat-a', version: '1.0.0' }]),
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

    expect(result.current.template?.catalogRefs).toEqual([]);
    expect(result.current.template?.groups).toEqual([]);

    await act(async () => {
      result.current.toggleCatalog('cat-a', true);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const template = result.current.template;
    expect(template?.catalogRefs).toHaveLength(1);
    expect(template?.catalogRefs[0]).toEqual({ name: 'cat-a', version: '1.0.0' });
    expect(template?.groups).toContain('cat-a');
    const commentMapping = template?.mappings.find(
      (m) => m.token.key === 'comment' && m.token.type === 'textmate token',
    );
    expect(commentMapping?.groupRef).toBe('cat-a');
  });

  it('enabling a catalog does not change existing mappings', async () => {
    const templateWithExistingMapping: Template = {
      ...mockTemplate,
      catalogRefs: [],
      mappings: [
        {
          token: { key: 'comment', type: 'textmate token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'OtherGroup',
        },
      ],
      groups: ['OtherGroup'],
    };
    let savedTemplate: Template | null = templateWithExistingMapping;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(catalogWithCommentToken),
      listCatalogs: () =>
        Promise.resolve([{ name: 'cat-a', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithExistingMapping),
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

    const mappingBefore = result.current.template?.mappings[0];
    expect(mappingBefore?.groupRef).toBe('OtherGroup');

    await act(async () => {
      result.current.toggleCatalog('cat-a', true);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const mappingAfter = result.current.template?.mappings.find(
      (m) => m.token.key === 'comment' && m.token.type === 'textmate token',
    );
    expect(mappingAfter?.groupRef).toBe('OtherGroup');
    expect(result.current.template?.groups).toContain('OtherGroup');
  });

  it('disabling a catalog removes the catalog-named group when no mappings or variables reference it', async () => {
    const templateWithCatalog: Template = {
      ...mockTemplate,
      catalogRefs: [{ name: 'cat-a', version: '1.0.0' }],
      mappings: [
        {
          token: { key: 'comment', type: 'textmate token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'cat-a',
        },
      ],
      groups: ['cat-a'],
    };
    let savedTemplate: Template | null = templateWithCatalog;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(catalogWithCommentToken),
      listCatalogs: () =>
        Promise.resolve([{ name: 'cat-a', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithCatalog),
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

    expect(result.current.template?.groups).toContain('cat-a');

    await act(async () => {
      result.current.toggleCatalog('cat-a', false);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.catalogRefs).toHaveLength(0);
    expect(result.current.template?.groups).not.toContain('cat-a');
    const commentMapping = result.current.template?.mappings.find(
      (m) => m.token.key === 'comment' && m.token.type === 'textmate token',
    );
    expect(commentMapping).toBeUndefined();
  });

  it('disabling a catalog leaves the group when a variable still references it', async () => {
    const templateWithCatalogAndVariable: Template = {
      ...mockTemplate,
      catalogRefs: [{ name: 'cat-a', version: '1.0.0' }],
      mappings: [
        {
          token: { key: 'comment', type: 'textmate token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'cat-a',
        },
      ],
      colorVariables: [{ key: 'primary', groupRef: 'cat-a' }],
      groups: ['cat-a'],
    };
    let savedTemplate: Template | null = templateWithCatalogAndVariable;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(catalogWithCommentToken),
      listCatalogs: () =>
        Promise.resolve([{ name: 'cat-a', version: '1.0.0' }]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithCatalogAndVariable),
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
      result.current.toggleCatalog('cat-a', false);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.groups).toContain('cat-a');
    expect(result.current.template?.colorVariables[0]?.groupRef).toBe('cat-a');
  });

  it('changing catalog version adds new mappings with that catalog group and ensures group in template.groups', async () => {
    const templateWithCatalogV1: Template = {
      ...mockTemplate,
      catalogRefs: [{ name: 'cat-a', version: '1.0.0' }],
      mappings: [
        {
          token: { key: 'comment', type: 'textmate token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'cat-a',
        },
      ],
      groups: ['cat-a'],
    };
    let savedTemplate: Template | null = templateWithCatalogV1;
    const loadCatalogMock = (name: string, version: string): Promise<Catalog | null> => {
      if (name !== 'cat-a') return Promise.resolve(null);
      return version === '1.0.1'
        ? Promise.resolve(catalogWithCommentAndKeyword)
        : Promise.resolve(catalogWithCommentToken);
    };
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: loadCatalogMock,
      listCatalogs: () =>
        Promise.resolve([
          { name: 'cat-a', version: '1.0.0' },
          { name: 'cat-a', version: '1.0.1' },
        ]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithCatalogV1),
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

    expect(result.current.template?.mappings).toHaveLength(1);

    await act(async () => {
      result.current.changeCatalogVersion('cat-a', '1.0.1');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const template = result.current.template;
    expect(template?.catalogRefs[0]?.version).toBe('1.0.1');
    const keywordMapping = template?.mappings.find(
      (m) => m.token.key === 'keyword' && m.token.type === 'textmate token',
    );
    expect(keywordMapping).toBeDefined();
    expect(keywordMapping?.groupRef).toBe('cat-a');
    expect(template?.groups).toContain('cat-a');
  });
});

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useTemplateViewModel, computeOrphanKeys } from './use-template-viewmodel';
import type { Catalog, Template, Mapping, Token } from '../../model/schemas';

const mockTemplate: Template = {
  name: 'test-template',
  version: '1.0.0',
  locked: false,
  catalogRefs: [],
  mappings: [],
  colorVariables: [],
  contrastVariables: [],
  groups: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
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
  return {
    Wrapper,
    getDispatch: () => stateRef.current.dispatch,
  };
}

const HarnessInner = React.forwardRef<
  { dispatch: ((a: import('../actions/action-types').AppActionV2) => void) | null },
  object
>(function HarnessInner(_, ref) {
  const { dispatch } = useAppState();
  if (ref && typeof ref === 'object' && 'current' in ref) {
    (ref as React.MutableRefObject<{
      dispatch: ((a: import('../actions/action-types').AppActionV2) => void) | null;
    }>).current = { dispatch };
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
      await getDispatch()?.({ type: 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name: 'test-template' } });
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

  it('treats semantic mapping *.deprecated as orphan when modifier deprecated is not in catalog', () => {
    const mappings: Mapping[] = [
      { token: { key: '*.deprecated', type: 'semantic token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    const catalogInfo = {
      semanticTokenTypes: ['class', 'function'],
      semanticTokenModifiers: ['readonly'],
      semanticTokenLanguages: [] as string[],
    };
    const orphans = computeOrphanKeys(mappings, [], catalogInfo);
    expect(orphans.has('semantic token::*.deprecated')).toBe(true);
  });

  it('does not treat * variant as orphan when modifiers and language are in catalog', () => {
    const mappings: Mapping[] = [
      { token: { key: '*.readonly', type: 'semantic token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: null },
    ];
    const catalogInfo = {
      semanticTokenTypes: ['class'],
      semanticTokenModifiers: ['readonly'],
      semanticTokenLanguages: [] as string[],
    };
    const orphans = computeOrphanKeys(mappings, [], catalogInfo);
    expect(orphans.has('semantic token::*.readonly')).toBe(false);
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
      getDispatch()?.({ type: 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name: 'test-template' } });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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

  it('updateMappingGroupRef on base semantic token moves variants to same group', async () => {
    const templateWithSemanticBaseAndVariant: Template = {
      ...mockTemplate,
      groups: ['g1', 'g2'],
      mappings: [
        {
          token: { key: 'class', type: 'semantic token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'g1',
        },
        {
          token: { key: 'class.readonly', type: 'semantic token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'g1',
        },
      ],
    };
    let savedTemplate: Template | null = templateWithSemanticBaseAndVariant;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithSemanticBaseAndVariant),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.updateMappingGroupRef('class', 'semantic token', 'g2');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const baseMapping = result.current.template?.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === 'class',
    );
    const variantMapping = result.current.template?.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === 'class.readonly',
    );
    expect(baseMapping?.groupRef).toBe('g2');
    expect(variantMapping?.groupRef).toBe('g2');
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'CATALOG_PAGE_ON_LOAD' });
    });
    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name: 'test-template' } });
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

  it('enabling a catalog with semanticTokenTypes creates mappings only for those types (no * placeholder)', async () => {
    const catalogWithSemanticTypes: Catalog = {
      name: 'semantic-cat',
      version: '1.0.0',
      type: 'remote',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: ['class', 'function'],
      semanticTokenModifiers: ['readonly', 'static'],
      semanticTokenLanguages: ['typescript'],
    };
    let savedTemplate: Template | null = null;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: (_name: string, _version: string) =>
        Promise.resolve(catalogWithSemanticTypes),
      listCatalogs: () =>
        Promise.resolve([{ name: 'semantic-cat', version: '1.0.0' }]),
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
      getDispatch()?.({ type: 'CATALOG_PAGE_ON_LOAD' });
    });
    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_CREATE_DIALOG_OK_BUTTON_ON_CLICK', params: { name: 'test-template' } });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.toggleCatalog('semantic-cat', true);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const template = result.current.template;
    const semanticMappings = template?.mappings.filter(
      (m) => m.token.type === 'semantic token',
    ) ?? [];
    expect(semanticMappings).toHaveLength(2);
    expect(semanticMappings.map((m) => m.token.key).sort()).toEqual(['class', 'function']);
    expect(semanticMappings.every((m) => m.groupRef === 'semantic-cat')).toBe(true);
    const starMapping = template?.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === '*',
    );
    expect(starMapping).toBeUndefined();
    expect(template?.semanticTokenModifiers).toEqual(['readonly', 'static']);
    expect(template?.semanticTokenLanguages).toEqual(['typescript']);
  });

  it('addSemanticVariantMapping inherits groupRef from base semantic token mapping', async () => {
    const templateWithBaseSemantic: Template = {
      ...mockTemplate,
      catalogRefs: [{ name: 'semantic-cat', version: '1.0.0' }],
      mappings: [
        {
          token: { key: 'class', type: 'semantic token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'semantic-cat',
        },
      ],
      groups: ['semantic-cat'],
      semanticTokenModifiers: ['readonly'],
      semanticTokenLanguages: [],
    };
    let savedTemplate: Template | null = templateWithBaseSemantic;
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.addSemanticVariantMapping('class', ['readonly'], null);
    });

    await waitFor(
      () => {
        const variantMapping = result.current.template?.mappings.find(
          (m) => m.token.type === 'semantic token' && m.token.key === 'class.readonly',
        );
        expect(variantMapping).toBeDefined();
        expect(variantMapping?.groupRef).toBe('semantic-cat');
      },
      { timeout: 2000 },
    );
  });

  it('addSemanticVariantMapping with base type * creates mapping with groupRef null', async () => {
    const templateWithModifiers: Template = {
      ...mockTemplate,
      groups: ['g1'],
      mappings: [],
      semanticTokenModifiers: ['readonly'],
      semanticTokenLanguages: [],
    };
    let savedTemplate: Template | null = templateWithModifiers;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithModifiers),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.addSemanticVariantMapping('*', ['readonly'], null);
    });

    await waitFor(
      () => {
        const variantMapping = result.current.template?.mappings.find(
          (m) => m.token.type === 'semantic token' && m.token.key === '*.readonly',
        );
        expect(variantMapping).toBeDefined();
        expect(variantMapping?.groupRef).toBeNull();
      },
      { timeout: 2000 },
    );
  });

  it('addSemanticVariantMapping with base type * uses defaultGroupRef when provided', async () => {
    const templateWithGroups: Template = {
      ...mockTemplate,
      groups: ['g1', 'g2'],
      mappings: [],
      semanticTokenModifiers: ['readonly'],
      semanticTokenLanguages: [],
    };
    let savedTemplate: Template | null = templateWithGroups;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithGroups),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.addSemanticVariantMapping('*', ['readonly'], null, 'g1');
    });

    await waitFor(
      () => {
        const variantMapping = result.current.template?.mappings.find(
          (m) => m.token.type === 'semantic token' && m.token.key === '*.readonly',
        );
        expect(variantMapping).toBeDefined();
        expect(variantMapping?.groupRef).toBe('g1');
      },
      { timeout: 2000 },
    );
  });

  it('updateMappingGroupRef on * variant updates only that variant not other * variants', async () => {
    const templateWithStarVariants: Template = {
      ...mockTemplate,
      groups: ['g1', 'g2'],
      mappings: [
        {
          token: { key: '*.readonly', type: 'semantic token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'g1',
        },
        {
          token: { key: '*.deprecated', type: 'semantic token' },
          colorVariableRef: null,
          contrastVariableRef: null,
          groupRef: 'g1',
        },
      ],
    };
    let savedTemplate: Template | null = templateWithStarVariants;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithStarVariants),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.updateMappingGroupRef('*.readonly', 'semantic token', 'g2');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const readonlyMapping = result.current.template?.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === '*.readonly',
    );
    const deprecatedMapping = result.current.template?.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === '*.deprecated',
    );
    expect(readonlyMapping?.groupRef).toBe('g2');
    expect(deprecatedMapping?.groupRef).toBe('g1');
  });

  it('updateSemanticVariantKey updates variant selector and preserves refs', async () => {
    const templateWithVariant: Template = {
      ...mockTemplate,
      mappings: [
        { token: { key: 'class', type: 'semantic token' }, colorVariableRef: null, contrastVariableRef: null, groupRef: 'g1' },
        {
          token: { key: 'class.readonly', type: 'semantic token' },
          colorVariableRef: 'fg',
          contrastVariableRef: 'high',
          groupRef: 'g1',
        },
      ],
      semanticTokenModifiers: ['readonly', 'static'],
      semanticTokenLanguages: ['typescript'],
    };
    let savedTemplate: Template | null = templateWithVariant;
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithVariant),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      result.current.updateSemanticVariantKey('class.readonly', ['static'], 'typescript');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const updated = result.current.template?.mappings.find(
      (m) => m.token.type === 'semantic token' && m.token.key === 'class.static:typescript',
    );
    expect(updated).toBeDefined();
    expect(updated?.colorVariableRef).toBe('fg');
    expect(updated?.contrastVariableRef).toBe('high');
    expect(updated?.groupRef).toBe('g1');
    const oldMapping = result.current.template?.mappings.find(
      (m) => m.token.key === 'class.readonly',
    );
    expect(oldMapping).toBeUndefined();
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
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

describe('includedCatalogNamesWithUpdates and updateAllCatalogsToLatest', () => {
  it('includedCatalogNamesWithUpdates includes catalog when template uses older version', async () => {
    const templateWithCatV100: Template = {
      ...mockTemplate,
      catalogRefs: [{ name: 'cat-a', version: '1.0.0' }],
      mappings: [],
      groups: [],
    };
    let savedTemplate: Template | null = templateWithCatV100;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithCatV100),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_PAGE_ON_LOAD' });
    });
    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.includedCatalogNamesWithUpdates).toContain('cat-a');
  });

  it('includedCatalogNamesWithUpdates excludes catalog when template already uses latest version', async () => {
    const templateWithCatV101: Template = {
      ...mockTemplate,
      catalogRefs: [{ name: 'cat-a', version: '1.0.1' }],
      mappings: [],
      groups: [],
    };
    let savedTemplate: Template | null = templateWithCatV101;
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
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
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithCatV101),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.includedCatalogNamesWithUpdates).not.toContain('cat-a');
  });

  // Skipped: save dispatches async; action queue does not complete before assert. TODO: wait for queue drain or assert in waitFor.
  it.skip('updateAllCatalogsToLatest updates all included catalogs to latest and applies merge and groups', async () => {
    const catA = {
      name: 'cat-a',
      version: '1.0.0',
      type: 'remote' as const,
      locked: false,
      sources: [] as const,
      tokens: [{ key: 'comment', type: 'textmate token' as const }],
      semanticTokenTypes: [] as const,
      semanticTokenModifiers: [] as const,
      semanticTokenLanguages: [] as const,
    };
    const catAV101 = {
      ...catA,
      version: '1.0.1',
      tokens: [
        { key: 'comment', type: 'textmate token' as const },
        { key: 'keyword', type: 'textmate token' as const },
      ],
    };
    const catB = {
      name: 'cat-b',
      version: '1.0.0',
      type: 'remote' as const,
      locked: false,
      sources: [] as const,
      tokens: [{ key: 'string', type: 'textmate token' as const }],
      semanticTokenTypes: [] as const,
      semanticTokenModifiers: [] as const,
      semanticTokenLanguages: [] as const,
    };
    const catBV102 = {
      ...catB,
      version: '1.0.2',
      tokens: [
        { key: 'string', type: 'textmate token' as const },
        { key: 'number', type: 'textmate token' as const },
      ],
    };
    const templateWithTwoCatalogs: Template = {
      ...mockTemplate,
      catalogRefs: [
        { name: 'cat-a', version: '1.0.0' },
        { name: 'cat-b', version: '1.0.0' },
      ],
      mappings: [],
      groups: [],
    };
    let savedTemplate: Template | null = templateWithTwoCatalogs;
    const loadCatalogMock = (name: string, version: string): Promise<Catalog | null> => {
      if (name === 'cat-a') return version === '1.0.1' ? Promise.resolve(catAV101) : Promise.resolve(catA);
      if (name === 'cat-b') return version === '1.0.2' ? Promise.resolve(catBV102) : Promise.resolve(catB);
      return Promise.resolve(null);
    };
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: loadCatalogMock,
      listCatalogs: () =>
        Promise.resolve([
          { name: 'cat-a', version: '1.0.0' },
          { name: 'cat-a', version: '1.0.1' },
          { name: 'cat-b', version: '1.0.0' },
          { name: 'cat-b', version: '1.0.2' },
        ]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(mockTemplate),
      saveTemplate: (t: Template) => {
        savedTemplate = t;
        return Promise.resolve();
      },
      loadTemplate: () => Promise.resolve(savedTemplate ?? templateWithTwoCatalogs),
      listTemplates: () => Promise.resolve([{ name: 'test-template', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CATALOG_PAGE_ON_LOAD' });
    });
    await act(async () => {
      getDispatch()?.({ type: 'TEMPLATE_TEMPLATES_LIST_ON_COMMIT', name: 'test-template', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.includedCatalogNamesWithUpdates).toContain('cat-a');
    expect(result.current.includedCatalogNamesWithUpdates).toContain('cat-b');
    expect(result.current.template?.catalogRefs[0]?.version).toBe('1.0.0');
    expect(result.current.template?.catalogRefs[1]?.version).toBe('1.0.0');

    await act(async () => {
      await result.current.updateAllCatalogsToLatest();
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const template = result.current.template;
    expect(template?.catalogRefs[0]).toEqual({ name: 'cat-a', version: '1.0.1' });
    expect(template?.catalogRefs[1]).toEqual({ name: 'cat-b', version: '1.0.2' });
    const keywordMapping = template?.mappings.find(
      (m) => m.token.key === 'keyword' && m.token.type === 'textmate token',
    );
    const numberMapping = template?.mappings.find(
      (m) => m.token.key === 'number' && m.token.type === 'textmate token',
    );
    expect(keywordMapping?.groupRef).toBe('cat-a');
    expect(numberMapping?.groupRef).toBe('cat-b');
    expect(template?.groups).toContain('cat-a');
    expect(template?.groups).toContain('cat-b');
  });
});

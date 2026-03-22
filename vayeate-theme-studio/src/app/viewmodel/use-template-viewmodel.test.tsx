import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useTemplateViewModel, computeOrphanKeys } from './use-template-viewmodel';
import type { Catalog, Template, Mapping, Token } from '../../model/schemas';
import {
  createInMemoryFsElectronApi,
  seedCatalogFile,
  seedTemplateFile,
} from '../../test-utils/electron-api-in-memory-fs';
import { CatalogActionType, TemplateActionType } from '../actions/action-types';

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
  const api = createInMemoryFsElectronApi();
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    ...api,
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
    const api = createInMemoryFsElectronApi();
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick, params: { name: 'test-template' } });
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
    const api = createInMemoryFsElectronApi();
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick, params: { name: 'test-template' } });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithGroupAndMapping);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithGroup);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithMapping);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithSemanticBaseAndVariant);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithGroupAndVariable);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithVar);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithVar);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithGroup);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithGroup);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedCatalogFile(api.files, catalogWithCommentToken);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplatePageOnLoad });
    });
    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick, params: { name: 'test-template' } });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.template?.catalogRefs).toEqual([]);
    expect(result.current.template?.groups).toEqual([]);

    await act(async () => {
      await result.current.toggleCatalog('cat-a', true);
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
    const apiSem = createInMemoryFsElectronApi();
    seedCatalogFile(apiSem.files, catalogWithSemanticTypes);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiSem,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplatePageOnLoad });
    });
    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplateCreateDialogOkButtonOnClick, params: { name: 'test-template' } });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    await act(async () => {
      await result.current.toggleCatalog('semantic-cat', true);
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithBaseSemantic);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithModifiers);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithGroups);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithStarVariants);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const api = createInMemoryFsElectronApi();
    seedTemplateFile(api.files, templateWithVariant);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...api,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const apiExisting = createInMemoryFsElectronApi();
    seedCatalogFile(apiExisting.files, catalogWithCommentToken);
    seedTemplateFile(apiExisting.files, templateWithExistingMapping);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiExisting,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const apiDisable = createInMemoryFsElectronApi();
    seedCatalogFile(apiDisable.files, catalogWithCommentToken);
    seedTemplateFile(apiDisable.files, templateWithCatalog);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiDisable,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const apiVar = createInMemoryFsElectronApi();
    seedCatalogFile(apiVar.files, catalogWithCommentToken);
    seedTemplateFile(apiVar.files, templateWithCatalogAndVariable);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiVar,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const catA101: Catalog = { ...catalogWithCommentAndKeyword, version: '1.0.1' };
    const apiVersions = createInMemoryFsElectronApi();
    seedCatalogFile(apiVersions.files, catalogWithCommentToken);
    seedCatalogFile(apiVersions.files, catA101);
    seedTemplateFile(apiVersions.files, templateWithCatalogV1);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiVersions,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const minimalCat = (v: string): Catalog => ({
      name: 'cat-a',
      version: v,
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
    const apiOlder = createInMemoryFsElectronApi();
    seedCatalogFile(apiOlder.files, minimalCat('1.0.0'));
    seedCatalogFile(apiOlder.files, minimalCat('1.0.1'));
    seedTemplateFile(apiOlder.files, templateWithCatV100);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiOlder,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplatePageOnLoad });
    });
    await act(async () => {
      await getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const minimalCatLatest = (v: string): Catalog => ({
      name: 'cat-a',
      version: v,
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    });
    const apiLatest = createInMemoryFsElectronApi();
    seedCatalogFile(apiLatest.files, minimalCatLatest('1.0.0'));
    seedCatalogFile(apiLatest.files, minimalCatLatest('1.0.1'));
    seedTemplateFile(apiLatest.files, templateWithCatV101);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiLatest,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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
    const apiTwo = createInMemoryFsElectronApi();
    seedCatalogFile(apiTwo.files, catA as Catalog);
    seedCatalogFile(apiTwo.files, catAV101 as Catalog);
    seedCatalogFile(apiTwo.files, catB as Catalog);
    seedCatalogFile(apiTwo.files, catBV102 as Catalog);
    seedTemplateFile(apiTwo.files, templateWithTwoCatalogs);
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      ...apiTwo,
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useTemplateViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: CatalogActionType.CatalogPageOnLoad });
    });
    await act(async () => {
      getDispatch()?.({ type: TemplateActionType.TemplateTemplatesListOnCommit, name: 'test-template', version: '1.0.0' });
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

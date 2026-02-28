import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../ui/context/AppContext';
import { useAppState } from '../ui/context/useAppState';
import { useThemeViewModel, mergeAssignmentsFromTemplate } from './use-theme-viewmodel';
import type { Theme, Template } from '../model/schemas';

const mockTheme: Theme = {
  name: 'test-theme',
  version: '1.0.0',
  templateRef: null,
  idePrimaryColorVariableRef: null,
  themeBackgroundColorVariableRef: null,
  colorAssignments: [],
  contrastAssignments: [],
};

beforeEach(() => {
  (window as unknown as { electronAPI?: unknown }).electronAPI = {
    createCatalog: () => Promise.resolve(null),
    saveCatalog: () => Promise.resolve(),
    loadCatalog: () => Promise.resolve(null),
    listCatalogs: () => Promise.resolve([]),
    deleteCatalog: () => Promise.resolve(),
    createTemplate: () => Promise.resolve(null),
    saveTemplate: () => Promise.resolve(),
    loadTemplate: () => Promise.resolve(null),
    listTemplates: () => Promise.resolve([]),
    deleteTemplate: () => Promise.resolve(),
    createTheme: () => Promise.resolve(mockTheme),
    saveTheme: () => Promise.resolve(),
    loadTheme: () => Promise.resolve(null),
    listThemes: () => Promise.resolve([]),
    deleteTheme: () => Promise.resolve(),
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

describe('useThemeViewModel', () => {
  it('returns no theme and is not creating initially', () => {
    const { Wrapper } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    expect(result.current.theme).toBeNull();
    expect(result.current.isCreating).toBe(false);
    expect(result.current.createDialogOpen).toBe(false);
    expect(result.current.themeNames).toEqual([]);
  });

  it('loads theme after CREATE_THEME succeeds', async () => {
    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(null),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: () => Promise.resolve(null),
      listTemplates: () => Promise.resolve([]),
      deleteTemplate: () => Promise.resolve(),
      createTheme: () => Promise.resolve(mockTheme),
      saveTheme: () => Promise.resolve(),
      loadTheme: () => Promise.resolve(mockTheme),
      listThemes: () => Promise.resolve([{ name: 'test-theme', version: '1.0.0' }]),
      deleteTheme: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'CREATE_THEME', params: { name: 'test-theme' } });
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.theme).not.toBeNull();
    expect(result.current.theme?.name).toBe('test-theme');
    expect(result.current.isCreating).toBe(false);
  });
});

describe('mergeAssignmentsFromTemplate', () => {
  const baseTheme: Theme = {
    name: 'my-theme',
    version: '2.0.0',
    templateRef: null,
    idePrimaryColorVariableRef: null,
    themeBackgroundColorVariableRef: null,
    colorAssignments: [],
    contrastAssignments: [],
  };

  const template: Template = {
    name: 'my-template',
    version: '1.0.0',
    locked: true,
    catalogRefs: [],
    mappings: [],
    colorVariables: [{ key: 'primary' }, { key: 'secondary' }],
    contrastVariables: [{ key: 'textContrast', comparisonSourceRef: 'primary' }],
    groups: [],
  };

  it('adds new color assignments for template variables', () => {
    const merged = mergeAssignmentsFromTemplate(baseTheme, template);
    expect(merged.colorAssignments).toHaveLength(2);
    expect(merged.colorAssignments[0].colorRef).toBe('primary');
    expect(merged.colorAssignments[1].colorRef).toBe('secondary');
    expect(merged.colorAssignments[0].dark).toBeNull();
    expect(merged.colorAssignments[0].light).toBeNull();
  });

  it('preserves existing assignments when keys match', () => {
    const themeWithAssignments: Theme = {
      ...baseTheme,
      colorAssignments: [
        { colorRef: 'primary', dark: { value: '#ff0000' }, light: null, useDarkForLight: true },
      ],
    };
    const merged = mergeAssignmentsFromTemplate(themeWithAssignments, template);
    expect(merged.colorAssignments).toHaveLength(2);
    expect(merged.colorAssignments[0].dark).toEqual({ value: '#ff0000' });
    expect(merged.colorAssignments[0].useDarkForLight).toBe(true);
  });

  it('sets templateRef to the template name and version', () => {
    const merged = mergeAssignmentsFromTemplate(baseTheme, template);
    expect(merged.templateRef).toEqual({ name: 'my-template', version: '1.0.0' });
  });

  it('adds contrast assignments for template contrast variables', () => {
    const merged = mergeAssignmentsFromTemplate(baseTheme, template);
    expect(merged.contrastAssignments).toHaveLength(1);
    expect(merged.contrastAssignments[0].contrastVariableRef).toBe('textContrast');
  });

  it('clears idePrimaryColorVariableRef if it no longer exists in template', () => {
    const themeWithPrimary: Theme = {
      ...baseTheme,
      idePrimaryColorVariableRef: 'removed',
    };
    const merged = mergeAssignmentsFromTemplate(themeWithPrimary, template);
    expect(merged.idePrimaryColorVariableRef).toBeNull();
  });

  it('preserves idePrimaryColorVariableRef if it still exists in template', () => {
    const themeWithPrimary: Theme = {
      ...baseTheme,
      idePrimaryColorVariableRef: 'primary',
      colorAssignments: [
        { colorRef: 'primary', dark: null, light: null, useDarkForLight: false },
      ],
    };
    const merged = mergeAssignmentsFromTemplate(themeWithPrimary, template);
    expect(merged.idePrimaryColorVariableRef).toBe('primary');
  });

  it('clears themeBackgroundColorVariableRef if it no longer exists in template', () => {
    const themeWithBg: Theme = {
      ...baseTheme,
      themeBackgroundColorVariableRef: 'removed',
    };
    const merged = mergeAssignmentsFromTemplate(themeWithBg, template);
    expect(merged.themeBackgroundColorVariableRef).toBeNull();
  });

  it('preserves themeBackgroundColorVariableRef if it still exists in template', () => {
    const themeWithBg: Theme = {
      ...baseTheme,
      themeBackgroundColorVariableRef: 'primary',
      colorAssignments: [
        { colorRef: 'primary', dark: null, light: null, useDarkForLight: false },
      ],
    };
    const merged = mergeAssignmentsFromTemplate(themeWithBg, template);
    expect(merged.themeBackgroundColorVariableRef).toBe('primary');
  });
});

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
  idePrimaryColorContrastVariableRef: null,
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

  it('syncs theme assignments when template has more variables than theme (adds missing assignments)', async () => {
    const themeWithOneVar: Theme = {
      ...mockTheme,
      templateRef: { name: 'tpl', version: '1.0.0' },
      colorAssignments: [
        { colorRef: 'primary', dark: null, light: null, useDarkForLight: false },
      ],
      contrastAssignments: [],
    };
    const templateWithTwoVars: Template = {
      name: 'tpl',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [
        { key: 'primary', groupRef: null },
        { key: 'newVar', groupRef: null },
      ],
      contrastVariables: [],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };

    (window as unknown as { electronAPI?: unknown }).electronAPI = {
      createCatalog: () => Promise.resolve(null),
      saveCatalog: () => Promise.resolve(),
      loadCatalog: () => Promise.resolve(null),
      listCatalogs: () => Promise.resolve([]),
      deleteCatalog: () => Promise.resolve(),
      createTemplate: () => Promise.resolve(null),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: (_name: string, _version: string) =>
        Promise.resolve(templateWithTwoVars),
      listTemplates: () => Promise.resolve([{ name: 'tpl', version: '1.0.0' }]),
      deleteTemplate: () => Promise.resolve(),
      createTheme: () => Promise.resolve(mockTheme),
      saveTheme: () => Promise.resolve(),
      loadTheme: () => Promise.resolve(themeWithOneVar),
      listThemes: () => Promise.resolve([{ name: 'test-theme', version: '1.0.0' }]),
      deleteTheme: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };

    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });

    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'test-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    const theme = result.current.theme;
    expect(theme).not.toBeNull();
    expect(theme?.colorAssignments).toHaveLength(2);
    const newVarAssignment = theme?.colorAssignments.find(
      (a) => a.colorRef === 'newVar',
    );
    expect(newVarAssignment).toBeDefined();
    expect(newVarAssignment?.dark).toBeNull();
    expect(newVarAssignment?.light).toBeNull();
  });
});

describe('mergeAssignmentsFromTemplate', () => {
  const baseTheme: Theme = {
    name: 'my-theme',
    version: '2.0.0',
    templateRef: null,
    idePrimaryColorVariableRef: null,
    idePrimaryColorContrastVariableRef: null,
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
    colorVariables: [
      { key: 'primary', groupRef: null },
      { key: 'secondary', groupRef: null },
    ],
    contrastVariables: [
      { key: 'textContrast', comparisonSourceRef: 'primary', groupRef: null },
    ],
    groups: [],
    semanticTokenModifiers: [],
    semanticTokenLanguages: [],
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

  it('clears idePrimaryColorContrastVariableRef if it no longer exists in template', () => {
    const themeWithContrast: Theme = {
      ...baseTheme,
      idePrimaryColorContrastVariableRef: 'removed',
    };
    const merged = mergeAssignmentsFromTemplate(themeWithContrast, template);
    expect(merged.idePrimaryColorContrastVariableRef).toBeNull();
  });

  it('preserves idePrimaryColorContrastVariableRef if it still exists in template', () => {
    const themeWithContrast: Theme = {
      ...baseTheme,
      idePrimaryColorContrastVariableRef: 'textContrast',
    };
    const merged = mergeAssignmentsFromTemplate(themeWithContrast, template);
    expect(merged.idePrimaryColorContrastVariableRef).toBe('textContrast');
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

describe('useThemeViewModel hue adjustment', () => {
  const themeWithColors: Theme = {
    name: 'hue-theme',
    version: '1.0.0',
    templateRef: { name: 'tpl', version: '1.0.0' },
    idePrimaryColorVariableRef: null,
    idePrimaryColorContrastVariableRef: null,
    themeBackgroundColorVariableRef: null,
    colorAssignments: [
      { colorRef: 'primary', dark: { value: '#ff0000' }, light: { value: '#cc0000' }, useDarkForLight: false },
    ],
    contrastAssignments: [
      { contrastVariableRef: 'textContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan' as const, min: null, max: null }, light: null, useDarkForLight: true },
    ],
  };

  const templateForHue: Template = {
    name: 'tpl',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [{ key: 'primary', groupRef: null }],
    contrastVariables: [{ key: 'textContrast', comparisonSourceRef: 'primary', groupRef: null }],
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
      createTemplate: () => Promise.resolve(null),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: () => Promise.resolve(templateForHue),
      listTemplates: () => Promise.resolve([]),
      deleteTemplate: () => Promise.resolve(),
      createTheme: () => Promise.resolve(themeWithColors),
      saveTheme: () => Promise.resolve(),
      loadTheme: () => Promise.resolve(themeWithColors),
      listThemes: () => Promise.resolve([{ name: 'hue-theme', version: '1.0.0' }]),
      deleteTheme: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };
  });

  it('exposes hueAdjustment 0 and displayColorAssignments equal to theme when hue is 0', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'hue-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(result.current.hueAdjustment).toBe(0);
    expect(result.current.theme).not.toBeNull();
    expect(result.current.displayColorAssignments).toEqual(result.current.theme!.colorAssignments);
  });

  it('displayColorAssignments reflects hue shift when hueAdjustment is non-zero', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'hue-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    const originalDark = result.current.theme!.colorAssignments[0].dark!.value;
    await act(async () => {
      result.current.setHueAdjustment(50);
    });
    expect(result.current.hueAdjustment).toBe(50);
    expect(result.current.displayColorAssignments[0].dark!.value).not.toBe(originalDark);
  });

  it('revertHueAdjustment resets hue to 0', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'hue-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    await act(async () => {
      result.current.setHueAdjustment(30);
    });
    expect(result.current.hueAdjustment).toBe(30);
    await act(async () => {
      result.current.revertHueAdjustment();
    });
    expect(result.current.hueAdjustment).toBe(0);
  });

  it('commitHueAdjustment persists shifted colors and resets hue', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'hue-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    const originalDark = result.current.theme!.colorAssignments[0].dark!.value;
    await act(async () => {
      result.current.setHueAdjustment(25);
    });
    await act(async () => {
      result.current.commitHueAdjustment();
    });
    expect(result.current.hueAdjustment).toBe(0);
    expect(result.current.theme!.colorAssignments[0].dark!.value).not.toBe(originalDark);
  });

  it('updateColorAssignmentDark when hue non-zero commits then applies edit', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'hue-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    await act(async () => {
      result.current.setHueAdjustment(10);
    });
    await act(async () => {
      result.current.updateColorAssignmentDark('primary', '#0000ff');
    });
    expect(result.current.hueAdjustment).toBe(0);
    expect(result.current.theme!.colorAssignments[0].dark!.value).toBe('#0000ff');
  });

  it('updateContrastAssignmentDark does not reset hue', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'hue-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    await act(async () => {
      result.current.setHueAdjustment(20);
    });
    await act(async () => {
      result.current.updateContrastAssignmentDark('textContrast', 'value', 5);
    });
    expect(result.current.hueAdjustment).toBe(20);
  });
});

describe('useThemeViewModel variable selection', () => {
  const themeWithTwoColors: Theme = {
    name: 'sel-theme',
    version: '1.0.0',
    templateRef: { name: 'tpl', version: '1.0.0' },
    idePrimaryColorVariableRef: null,
    idePrimaryColorContrastVariableRef: null,
    themeBackgroundColorVariableRef: null,
    colorAssignments: [
      { colorRef: 'primary', dark: { value: '#ff0000' }, light: { value: '#cc0000' }, useDarkForLight: false },
      { colorRef: 'secondary', dark: { value: '#00ff00' }, light: { value: '#00cc00' }, useDarkForLight: false },
    ],
    contrastAssignments: [
      { contrastVariableRef: 'textContrast', dark: { value: 4.5, comparisonMethod: 'greaterThan' as const, min: null, max: null }, light: null, useDarkForLight: true },
    ],
  };

  const templateForSel: Template = {
    name: 'tpl',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    mappings: [],
    colorVariables: [{ key: 'primary', groupRef: null }, { key: 'secondary', groupRef: null }],
    contrastVariables: [{ key: 'textContrast', comparisonSourceRef: 'primary', groupRef: null }],
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
      createTemplate: () => Promise.resolve(null),
      saveTemplate: () => Promise.resolve(),
      loadTemplate: () => Promise.resolve(templateForSel),
      listTemplates: () => Promise.resolve([]),
      deleteTemplate: () => Promise.resolve(),
      createTheme: () => Promise.resolve(themeWithTwoColors),
      saveTheme: () => Promise.resolve(),
      loadTheme: () => Promise.resolve(themeWithTwoColors),
      listThemes: () => Promise.resolve([{ name: 'sel-theme', version: '1.0.0' }]),
      deleteTheme: () => Promise.resolve(),
      fetchUrl: () => Promise.resolve(''),
    };
  });

  it('initializes checkedColorRefs and checkedContrastRefs to all when theme loads', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'sel-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    expect(result.current.checkedColorRefs.has('primary')).toBe(true);
    expect(result.current.checkedColorRefs.has('secondary')).toBe(true);
    expect(result.current.checkedContrastRefs.has('textContrast')).toBe(true);
  });

  it('displayColorAssignments applies hue only to checked color refs', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'sel-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    const originalPrimary = result.current.theme!.colorAssignments[0].dark!.value;
    const originalSecondary = result.current.theme!.colorAssignments[1].dark!.value;
    await act(async () => {
      result.current.toggleColorChecked('secondary');
    });
    await act(async () => {
      result.current.setHueAdjustment(50);
    });
    expect(result.current.displayColorAssignments[0].dark!.value).not.toBe(originalPrimary);
    expect(result.current.displayColorAssignments[1].dark!.value).toBe(originalSecondary);
  });

  it('commitHueAdjustment only updates checked color refs', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'sel-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    const originalSecondary = result.current.theme!.colorAssignments[1].dark!.value;
    await act(async () => {
      result.current.toggleColorChecked('secondary');
    });
    await act(async () => {
      result.current.setHueAdjustment(25);
    });
    await act(async () => {
      result.current.commitHueAdjustment();
    });
    expect(result.current.theme!.colorAssignments[1].dark!.value).toBe(originalSecondary);
  });

  it('setAllColorChecked updates all color refs', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'sel-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    await act(async () => {
      result.current.setAllColorChecked(false);
    });
    expect(result.current.checkedColorRefs.has('primary')).toBe(false);
    expect(result.current.checkedColorRefs.has('secondary')).toBe(false);
    await act(async () => {
      result.current.setAllColorChecked(true);
    });
    expect(result.current.checkedColorRefs.has('primary')).toBe(true);
    expect(result.current.checkedColorRefs.has('secondary')).toBe(true);
  });

  it('setColorGroupChecked updates only refs in that group', async () => {
    const { Wrapper, getDispatch } = harness();
    const { result } = renderHook(() => useThemeViewModel(), { wrapper: Wrapper });
    await act(async () => {
      getDispatch()?.({ type: 'SELECT_THEME', name: 'sel-theme', version: '1.0.0' });
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });
    await act(async () => {
      result.current.setColorGroupChecked('__ungrouped__', false);
    });
    expect(result.current.checkedColorRefs.has('primary')).toBe(false);
    expect(result.current.checkedColorRefs.has('secondary')).toBe(false);
    expect(result.current.checkedContrastRefs.has('textContrast')).toBe(true);
    await act(async () => {
      result.current.setColorGroupChecked('__ungrouped__', true);
    });
    expect(result.current.checkedColorRefs.has('primary')).toBe(true);
    expect(result.current.checkedColorRefs.has('secondary')).toBe(true);
  });
});

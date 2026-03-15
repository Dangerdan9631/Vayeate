import {
  appStateReducer,
  initialAppState,
  type AppState,
  type AppStateUpdate,
} from './app-state';
import type { Catalog, CatalogReference, Template, TemplateReference, Theme, ThemeReference } from '../model/schemas';

const sampleCatalog: Catalog = {
  name: 'test-catalog',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
  semanticTokenTypes: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

const sampleRef: CatalogReference = { name: 'test-catalog', version: '1.0.0' };

const sampleTemplate: Template = {
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

const sampleTemplateRef: TemplateReference = { name: 'test-template', version: '1.0.0' };

const sampleTheme: Theme = {
  name: 'test-theme',
  version: '1.0.0',
  templateRef: null,
  idePrimaryTokenRef: null,
  ideForegroundTokenRef: null,
  themeBackgroundTokenRef: null,
  themeForegroundTokenRef: null,
  lineNumberBackgroundTokenRef: null,
  lineNumberForegroundTokenRef: null,
  ideTabTokenRef: null,
  ideTabBarBackgroundTokenRef: null,
  ideTabBarForegroundTokenRef: null,
  editorPreviewScrollbarBackgroundTokenRef: null,
  editorPreviewScrollbarForegroundTokenRef: null,
  editorPreviewSelectionBackgroundTokenRef: null,
  editorPreviewMenuForegroundTokenRef: null,
  editorPreviewMenuBackgroundTokenRef: null,
  colorAssignments: [],
  contrastAssignments: [],
  applyPaletteToDark: true,
  applyPaletteToLight: true,
  paletteClusterCountK: 5,
  paletteClusterGroupIds: [],
};

const sampleThemeRef: ThemeReference = { name: 'test-theme', version: '1.0.0' };

describe('initialAppState', () => {
  it('has catalogs as default tab', () => {
    expect(initialAppState.activeTab).toBe('catalogs');
  });

  it('has no selected catalog and is not creating', () => {
    expect(initialAppState.catalogs.catalog).toBeNull();
    expect(initialAppState.catalogs.selectedRef).toBeNull();
    expect(initialAppState.catalogs.isCreating).toBe(false);
    expect(initialAppState.catalogs.createDialogOpen).toBe(false);
    expect(initialAppState.catalogs.catalogRefs).toEqual([]);
  });

  it('has no selected template and is not creating', () => {
    expect(initialAppState.templates.template).toBeNull();
    expect(initialAppState.templates.selectedRef).toBeNull();
    expect(initialAppState.templates.isCreating).toBe(false);
    expect(initialAppState.templates.createDialogOpen).toBe(false);
    expect(initialAppState.templates.createFormName).toBe('');
    expect(initialAppState.templates.templateRefs).toEqual([]);
    expect(initialAppState.templates.mappingSearchText).toBe('');
    expect(initialAppState.templates.mappingColorVariableFilter).toEqual([]);
    expect(initialAppState.templates.mappingContrastVariableFilter).toEqual([]);
    expect(initialAppState.templates.mappingTokenGroupSelection).toBe('');
    expect(initialAppState.templates.variablesSearchText).toBe('');
  });

  it('has no selected theme and is not creating', () => {
    expect(initialAppState.themes.theme).toBeNull();
    expect(initialAppState.themes.selectedRef).toBeNull();
    expect(initialAppState.themes.isCreating).toBe(false);
    expect(initialAppState.themes.createDialogOpen).toBe(false);
    expect(initialAppState.themes.createFormName).toBe('');
    expect(initialAppState.themes.generateResult).toBeNull();
    expect(initialAppState.themes.saveError).toBeNull();
    expect(initialAppState.themes.assignColorDraftText).toBe('');
    expect(initialAppState.themes.themeRefs).toEqual([]);
    expect(initialAppState.themes.previewVariableFilterText).toBe('');
    expect(initialAppState.themes.selectedPreviewSampleKey).toBe('');
  });

  it('has idle queue status', () => {
    expect(initialAppState.queueStatus.isProcessing).toBe(false);
    expect(initialAppState.queueStatus.queueLength).toBe(0);
  });
});

describe('appStateReducer', () => {
  it('handles SET_ACTIVE_TAB', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_ACTIVE_TAB', tabId: 'themes' });
    expect(state.activeTab).toBe('themes');
  });

  it('handles SET_CATALOG_REFS', () => {
    const refs = [sampleRef];
    const state = appStateReducer(initialAppState, { type: 'SET_CATALOG_REFS', refs });
    expect(state.catalogs.catalogRefs).toEqual(refs);
  });

  it('handles SET_SELECTED_REF', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_SELECTED_REF', ref: sampleRef });
    expect(state.catalogs.selectedRef).toEqual(sampleRef);
  });

  it('handles SET_CATALOG', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_CATALOG', catalog: sampleCatalog });
    expect(state.catalogs.catalog).toEqual(sampleCatalog);
  });

  it('handles SET_IS_CREATING', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_IS_CREATING', value: true });
    expect(state.catalogs.isCreating).toBe(true);
  });

  it('handles SET_CREATE_DIALOG_OPEN', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_CREATE_DIALOG_OPEN', value: true });
    expect(state.catalogs.createDialogOpen).toBe(true);
  });

  it('handles SET_QUEUE_STATUS', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_QUEUE_STATUS', isProcessing: true, queueLength: 3 });
    expect(state.queueStatus.isProcessing).toBe(true);
    expect(state.queueStatus.queueLength).toBe(3);
  });

  it('handles SET_TEMPLATE_REFS', () => {
    const refs = [sampleTemplateRef];
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_REFS', refs });
    expect(state.templates.templateRefs).toEqual(refs);
  });

  it('handles SET_SELECTED_TEMPLATE_REF', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_SELECTED_TEMPLATE_REF', ref: sampleTemplateRef });
    expect(state.templates.selectedRef).toEqual(sampleTemplateRef);
  });

  it('handles SET_TEMPLATE', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE', template: sampleTemplate });
    expect(state.templates.template).toEqual(sampleTemplate);
  });

  it('handles SET_TEMPLATE_IS_CREATING', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_IS_CREATING', value: true });
    expect(state.templates.isCreating).toBe(true);
  });

  it('handles SET_TEMPLATE_CREATE_DIALOG_OPEN', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
    expect(state.templates.createDialogOpen).toBe(true);
  });

  it('handles SET_TEMPLATE_CREATE_FORM_NAME', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_CREATE_FORM_NAME', value: 'my-template' });
    expect(state.templates.createFormName).toBe('my-template');
  });

  it('handles SET_TEMPLATE_MAPPING_SEARCH_TEXT', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_MAPPING_SEARCH_TEXT', value: 'foo' });
    expect(state.templates.mappingSearchText).toBe('foo');
  });

  it('handles SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER', values: ['fg', 'bg'] as import('../model/schemas').ColorVariableKey[] });
    expect(state.templates.mappingColorVariableFilter).toEqual(['fg', 'bg']);
  });

  it('handles SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER', values: ['contrast1'] as import('../model/schemas').ContrastVariableKey[] });
    expect(state.templates.mappingContrastVariableFilter).toEqual(['contrast1']);
  });

  it('handles SET_TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION', value: 'group1' });
    expect(state.templates.mappingTokenGroupSelection).toBe('group1');
  });

  it('handles SET_TEMPLATE_VARIABLES_SEARCH_TEXT', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_TEMPLATE_VARIABLES_SEARCH_TEXT', value: 'bar' });
    expect(state.templates.variablesSearchText).toBe('bar');
  });

  it('handles SET_THEME_REFS', () => {
    const refs = [sampleThemeRef];
    const state = appStateReducer(initialAppState, { type: 'SET_THEME_REFS', refs });
    expect(state.themes.themeRefs).toEqual(refs);
  });

  it('handles SET_SELECTED_THEME_REF', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_SELECTED_THEME_REF', ref: sampleThemeRef });
    expect(state.themes.selectedRef).toEqual(sampleThemeRef);
  });

  it('handles SET_THEME', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_THEME', theme: sampleTheme });
    expect(state.themes.theme).toEqual(sampleTheme);
  });

  it('handles SET_THEME_IS_CREATING', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_THEME_IS_CREATING', value: true });
    expect(state.themes.isCreating).toBe(true);
  });

  it('handles SET_THEME_CREATE_DIALOG_OPEN', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
    expect(state.themes.createDialogOpen).toBe(true);
  });

  it('handles SET_THEME_CREATE_FORM_NAME', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_THEME_CREATE_FORM_NAME', value: 'my-theme' });
    expect(state.themes.createFormName).toBe('my-theme');
  });

  it('handles SET_GENERATE_RESULT', () => {
    const state = appStateReducer(initialAppState, {
      type: 'SET_GENERATE_RESULT',
      result: { success: true, message: 'Generated themes' },
    });
    expect(state.themes.generateResult).toEqual({ success: true, message: 'Generated themes' });
  });

  it('handles SET_THEME_SAVE_ERROR', () => {
    const state = appStateReducer(initialAppState, {
      type: 'SET_THEME_SAVE_ERROR',
      error: 'Invalid theme: validation failed',
    });
    expect(state.themes.saveError).toBe('Invalid theme: validation failed');
    const cleared = appStateReducer(state, { type: 'SET_THEME_SAVE_ERROR', error: null });
    expect(cleared.themes.saveError).toBeNull();
  });

  it('handles SET_ASSIGN_COLOR_DRAFT_TEXT', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_ASSIGN_COLOR_DRAFT_TEXT', value: '#abc' });
    expect(state.themes.assignColorDraftText).toBe('#abc');
  });

  it('handles SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT', () => {
    const state = appStateReducer(initialAppState, {
      type: 'SET_THEME_PREVIEW_VARIABLE_FILTER_TEXT',
      value: 'filter',
    });
    expect(state.themes.previewVariableFilterText).toBe('filter');
  });

  it('handles SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY', () => {
    const state = appStateReducer(initialAppState, {
      type: 'SET_THEME_PREVIEW_SELECTED_SAMPLE_KEY',
      value: 'sample-1',
    });
    expect(state.themes.selectedPreviewSampleKey).toBe('sample-1');
  });

  it('returns state unchanged for unknown update type', () => {
    const before: AppState = { ...initialAppState, activeTab: 'templates' };
    const unknown = { type: 'UNKNOWN' } as unknown as AppStateUpdate;
    const state = appStateReducer(before, unknown);
    expect(state).toEqual(before);
  });
});

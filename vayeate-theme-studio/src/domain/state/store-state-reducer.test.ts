import type { Catalog, Template, Theme } from '../../model/schemas';
import { initialAppState } from './app-state';
import { storeStateReducer } from './store-state-reducer';

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

describe('storeStateReducer', () => {
  it('handles SET_STORE_CATALOG_ENTRY', () => {
    const state = storeStateReducer(initialAppState, {
      type: 'SET_STORE_CATALOG_ENTRY',
      name: 'catalog1',
      version: '1.0.1',
      isLoaded: true,
      catalog: sampleCatalog,
    });
    expect(state.store.catalogs['catalog1']['1.0.1']).toEqual({
      isLoaded: true,
      catalog: sampleCatalog,
    });
  });

  it('handles SET_STORE_CATALOG_ENTRY with isLoaded false and no catalog', () => {
    const state = storeStateReducer(initialAppState, {
      type: 'SET_STORE_CATALOG_ENTRY',
      name: 'catalog1',
      version: '1.0.0',
      isLoaded: false,
    });
    expect(state.store.catalogs['catalog1']['1.0.0']).toEqual({
      isLoaded: false,
      catalog: undefined,
    });
  });

  it('handles SET_STORE_TEMPLATE_ENTRY', () => {
    const state = storeStateReducer(initialAppState, {
      type: 'SET_STORE_TEMPLATE_ENTRY',
      name: 'tpl1',
      version: '2.0.0',
      isLoaded: true,
      template: sampleTemplate,
    });
    expect(state.store.templates['tpl1']['2.0.0']).toEqual({
      isLoaded: true,
      template: sampleTemplate,
    });
  });

  it('handles SET_STORE_THEME_ENTRY', () => {
    const state = storeStateReducer(initialAppState, {
      type: 'SET_STORE_THEME_ENTRY',
      name: 'theme1',
      version: '1.0.0',
      isLoaded: true,
      theme: sampleTheme,
    });
    expect(state.store.themes['theme1']['1.0.0']).toEqual({
      isLoaded: true,
      theme: sampleTheme,
    });
  });

  it('handles SET_STORE_CATALOG_ENTRIES with values from caller', () => {
    const entries = [
      { name: 'cat-a', version: '1.0.0', isLoaded: false, catalog: undefined },
      { name: 'cat-a', version: '1.0.1', isLoaded: true, catalog: sampleCatalog },
      { name: 'cat-b', version: '2.0.0', isLoaded: false, catalog: undefined },
    ];
    const state = storeStateReducer(initialAppState, { type: 'SET_STORE_CATALOG_ENTRIES', entries });
    expect(state.store.catalogs['cat-a']['1.0.0']).toEqual({ isLoaded: false, catalog: undefined });
    expect(state.store.catalogs['cat-a']['1.0.1']).toEqual({ isLoaded: true, catalog: sampleCatalog });
    expect(state.store.catalogs['cat-b']['2.0.0']).toEqual({ isLoaded: false, catalog: undefined });
    expect(Object.keys(state.store.catalogs)).toHaveLength(2);
  });

  it('handles SET_STORE_CATALOG_ENTRIES with empty entries', () => {
    const state = storeStateReducer(initialAppState, { type: 'SET_STORE_CATALOG_ENTRIES', entries: [] });
    expect(state.store.catalogs).toEqual({});
  });

  it('handles SET_STORE_TEMPLATE_ENTRIES', () => {
    const entries = [{ name: 'tpl-x', version: '1.0.0', isLoaded: false, template: undefined }];
    const state = storeStateReducer(initialAppState, { type: 'SET_STORE_TEMPLATE_ENTRIES', entries });
    expect(state.store.templates['tpl-x']['1.0.0']).toEqual({ isLoaded: false, template: undefined });
  });

  it('handles SET_STORE_THEME_ENTRIES', () => {
    const entries = [{ name: 'th-y', version: '2.0.0', isLoaded: false, theme: undefined }];
    const state = storeStateReducer(initialAppState, { type: 'SET_STORE_THEME_ENTRIES', entries });
    expect(state.store.themes['th-y']['2.0.0']).toEqual({ isLoaded: false, theme: undefined });
  });

  it('returns state unchanged for unknown update type', () => {
    const before = {
      ...initialAppState,
      store: {
        ...initialAppState.store,
        catalogs: { catalog1: { '1.0.0': { isLoaded: false, catalog: undefined } } },
        templates: {},
        themes: {},
      },
    };
    const unknown = { type: 'UNKNOWN' } as unknown as Parameters<typeof storeStateReducer>[1];
    const state = storeStateReducer(before, unknown);
    expect(state).toEqual(before);
  });
});

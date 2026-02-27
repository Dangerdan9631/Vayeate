import {
  appStateReducer,
  initialAppState,
  type AppState,
  type AppStateUpdate,
} from './app-state';
import type { Catalog, CatalogReference, Template, TemplateReference } from '../model/schemas';

const sampleCatalog: Catalog = {
  name: 'test-catalog',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
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
};

const sampleTemplateRef: TemplateReference = { name: 'test-template', version: '1.0.0' };

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
    expect(initialAppState.templates.templateRefs).toEqual([]);
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

  it('returns state unchanged for unknown update type', () => {
    const before: AppState = { ...initialAppState, activeTab: 'templates' };
    const unknown = { type: 'UNKNOWN' } as unknown as AppStateUpdate;
    const state = appStateReducer(before, unknown);
    expect(state).toEqual(before);
  });
});

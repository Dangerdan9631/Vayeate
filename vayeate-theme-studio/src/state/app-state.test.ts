import {
  appStateReducer,
  initialAppState,
  type AppState,
  type AppStateUpdate,
} from './app-state';
import type { Catalog } from '../model/schemas';

const sampleCatalog: Catalog = {
  name: 'test-catalog',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
};

describe('initialAppState', () => {
  it('has catalogs as default tab', () => {
    expect(initialAppState.activeTab).toBe('catalogs');
  });

  it('has no created catalog and is not creating', () => {
    expect(initialAppState.catalogs.created).toBeNull();
    expect(initialAppState.catalogs.isCreating).toBe(false);
  });
});

describe('appStateReducer', () => {
  it('handles SET_ACTIVE_TAB', () => {
    const state = appStateReducer(initialAppState, { type: 'SET_ACTIVE_TAB', tabId: 'themes' });
    expect(state.activeTab).toBe('themes');
  });

  it('handles CREATE_CATALOG_START', () => {
    const state = appStateReducer(initialAppState, { type: 'CREATE_CATALOG_START' });
    expect(state.catalogs.isCreating).toBe(true);
    expect(state.catalogs.created).toBeNull();
  });

  it('handles CREATE_CATALOG_SUCCESS', () => {
    const withStart = appStateReducer(initialAppState, { type: 'CREATE_CATALOG_START' });
    const state = appStateReducer(withStart, { type: 'CREATE_CATALOG_SUCCESS', catalog: sampleCatalog });
    expect(state.catalogs.created).toEqual(sampleCatalog);
    expect(state.catalogs.isCreating).toBe(false);
  });

  it('handles CREATE_CATALOG_ERROR', () => {
    const withStart = appStateReducer(initialAppState, { type: 'CREATE_CATALOG_START' });
    const state = appStateReducer(withStart, { type: 'CREATE_CATALOG_ERROR' });
    expect(state.catalogs.isCreating).toBe(false);
    expect(state.catalogs.created).toBeNull();
  });

  it('returns state unchanged for unknown update type', () => {
    const before: AppState = { ...initialAppState, activeTab: 'templates' };
    const unknown = { type: 'UNKNOWN' } as unknown as AppStateUpdate;
    const state = appStateReducer(before, unknown);
    expect(state).toEqual(before);
  });
});

import { closedEyedropperUiState } from './eyedropper-ui-state';
import { initialAppState } from './app-state';
import { uiStateReducer } from './ui-state-reducer';

describe('uiStateReducer', () => {
  it('handles SET_UI_ACTIVE_TAB_ID', () => {
    const state = uiStateReducer(initialAppState, { type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'themes' });
    expect(state.ui.activeTabId).toBe('themes');
  });

  it('handles SET_UI_QUEUE_STATUS', () => {
    const state = uiStateReducer(initialAppState, {
      type: 'SET_UI_QUEUE_STATUS',
      isProcessing: true,
      queueLength: 3,
    });
    expect(state.ui.queueStatus.isProcessing).toBe(true);
    expect(state.ui.queueStatus.queueLength).toBe(3);
  });

  it('handles SET_UI_MENU_OPEN_STATE', () => {
    const state = uiStateReducer(initialAppState, {
      type: 'SET_UI_MENU_OPEN_STATE',
      menuId: 'view',
      isOpen: true,
    });
    expect(state.ui.menuOpen.viewOpen).toBe(true);
    expect(state.ui.menuOpen.fileOpen).toBe(false);
  });

  it('handles SET_UI_ALL_MENUS_CLOSED', () => {
    const opened = uiStateReducer(initialAppState, {
      type: 'SET_UI_MENU_OPEN_STATE',
      menuId: 'file',
      isOpen: true,
    });
    const closed = uiStateReducer(opened, { type: 'SET_UI_ALL_MENUS_CLOSED' });
    expect(closed.ui.menuOpen.fileOpen).toBe(false);
    expect(closed.ui.menuOpen.editOpen).toBe(false);
    expect(closed.ui.menuOpen.historyOpen).toBe(false);
    expect(closed.ui.menuOpen.viewOpen).toBe(false);
  });

  it('handles SET_UI_EYEDROPPER', () => {
    const next = { ...closedEyedropperUiState, phase: 'loading' as const, contextKey: 'eyedropper:hue' };
    const state = uiStateReducer(initialAppState, { type: 'SET_UI_EYEDROPPER', eyedropper: next });
    expect(state.ui.eyedropper.phase).toBe('loading');
    expect(state.ui.eyedropper.contextKey).toBe('eyedropper:hue');
  });

  it('returns state unchanged for unknown update type', () => {
    const before = {
      ...initialAppState,
      ui: { ...initialAppState.ui, activeTabId: 'templates' as const },
    };
    const unknown = { type: 'UNKNOWN' } as unknown as Parameters<typeof uiStateReducer>[1];
    const state = uiStateReducer(before, unknown);
    expect(state).toEqual(before);
  });
});

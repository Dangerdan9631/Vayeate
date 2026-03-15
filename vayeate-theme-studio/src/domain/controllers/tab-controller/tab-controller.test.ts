import { vi } from 'vitest';
import type { UiStateUpdate } from '../../state/ui-state-reducer';
import { setActiveTab } from '.';

describe('tab-controller', () => {
  describe('setActiveTab', () => {
    it('calls setUiState with SET_UI_ACTIVE_TAB_ID for the given tabId', () => {
      const updates: UiStateUpdate[] = [];
      const setUiState = (update: UiStateUpdate) => updates.push(update);

      setActiveTab(setUiState, 'themes');

      expect(updates).toEqual([{ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'themes' }]);
    });

    it('works for each tab id', () => {
      const setUiState = vi.fn<(u: UiStateUpdate) => void>();

      setActiveTab(setUiState, 'catalogs');
      expect(setUiState).toHaveBeenCalledWith({ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'catalogs' });

      setUiState.mockClear();
      setActiveTab(setUiState, 'templates');
      expect(setUiState).toHaveBeenCalledWith({ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'templates' });
    });
  });
});

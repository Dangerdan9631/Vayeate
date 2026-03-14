import type { AppStateUpdate } from '../state/app-state';
import { setActiveTab } from './tab-controller';

describe('tab-controller', () => {
  describe('setActiveTab', () => {
    it('calls setState with SET_ACTIVE_TAB for the given tabId', () => {
      const updates: AppStateUpdate[] = [];
      const setState = (update: AppStateUpdate) => updates.push(update);

      setActiveTab(setState, 'themes');

      expect(updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'themes' }]);
    });

    it('works for each tab id', () => {
      const setState = vi.fn<(u: AppStateUpdate) => void>();

      setActiveTab(setState, 'catalogs');
      expect(setState).toHaveBeenCalledWith({ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' });

      setState.mockClear();
      setActiveTab(setState, 'templates');
      expect(setState).toHaveBeenCalledWith({ type: 'SET_ACTIVE_TAB', tabId: 'templates' });
    });
  });
});

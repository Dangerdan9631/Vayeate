import type { AppStateUpdate } from '../state/app-state';
import { handleTabBarOnSelect } from './tab-controller';

describe('tab-controller', () => {
  describe('handleTabBarOnSelect', () => {
    it('calls setState with SET_ACTIVE_TAB for the given tabId', () => {
      const updates: AppStateUpdate[] = [];
      const setState = (update: AppStateUpdate) => updates.push(update);

      handleTabBarOnSelect(setState, 'themes');

      expect(updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'themes' }]);
    });

    it('works for each tab id', () => {
      const setState = vi.fn<(u: AppStateUpdate) => void>();

      handleTabBarOnSelect(setState, 'catalogs');
      expect(setState).toHaveBeenCalledWith({ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' });

      setState.mockClear();
      handleTabBarOnSelect(setState, 'templates');
      expect(setState).toHaveBeenCalledWith({ type: 'SET_ACTIVE_TAB', tabId: 'templates' });
    });
  });
});

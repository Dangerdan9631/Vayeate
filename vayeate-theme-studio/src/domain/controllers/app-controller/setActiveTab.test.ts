import { describe, expect, it, vi } from 'vitest';
import type { UiStateUpdate } from '../../state/ui-state-reducer';
import { UiStateSetter } from '../../state/ui-state-setter';
import { SetActiveTabController } from './setActiveTab';

describe('SetActiveTabController', () => {
  it('calls uiStateSetter with SET_UI_ACTIVE_TAB_ID for the given tabId', () => {
    const updates: UiStateUpdate[] = [];
    const uiStateSetter = new UiStateSetter((update) => updates.push(update));
    const controller = new SetActiveTabController(uiStateSetter);

    controller.run('themes');

    expect(updates).toEqual([{ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'themes' }]);
  });

  it('works for each tab id', () => {
    const apply = vi.fn<(u: UiStateUpdate) => void>();
    const uiStateSetter = new UiStateSetter(apply);
    const controller = new SetActiveTabController(uiStateSetter);

    controller.run('catalogs');
    expect(apply).toHaveBeenCalledWith({ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'catalogs' });

    apply.mockClear();
    controller.run('templates');
    expect(apply).toHaveBeenCalledWith({ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'templates' });
  });
});

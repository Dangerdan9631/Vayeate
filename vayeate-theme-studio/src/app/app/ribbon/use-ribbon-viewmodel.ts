import type { TabId } from '../../../model/app-ui';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { AppRibbonActionType } from './actions/app-ribbon-action-type';

/**
 * Action callbacks exposed by the ribbon viewmodel.
 */
export interface RibbonViewModel {
  onRibbonTabButtonClick: (tabId: TabId) => void;
}

/**
 * Provides ribbon tab click dispatching for primary navigation.
 * @returns Callbacks for ribbon tab button interactions.
 */
export function useRibbonViewModel(): RibbonViewModel {
  const dispatch = useAppDispatch();

  function onRibbonTabButtonClick(tabId: TabId): void {
    void dispatch({ type: AppRibbonActionType.TabButtonOnClick, tabId });
  }

  return {
    onRibbonTabButtonClick,
  };
}

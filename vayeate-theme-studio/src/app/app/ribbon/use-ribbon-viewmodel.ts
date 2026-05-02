import type { TabId } from '../../../model/app-ui';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { AppRibbonActionType } from './actions/app-ribbon-action-type';

export interface RibbonViewModel {
  onRibbonTabButtonClick: (tabId: TabId) => void;
}

export function useRibbonViewModel(): RibbonViewModel {
  const dispatch = useAppDispatch();

  function onRibbonTabButtonClick(tabId: TabId): void {
    void dispatch({ type: AppRibbonActionType.TabButtonOnClick, tabId });
  }

  return {
    onRibbonTabButtonClick,
  };
}

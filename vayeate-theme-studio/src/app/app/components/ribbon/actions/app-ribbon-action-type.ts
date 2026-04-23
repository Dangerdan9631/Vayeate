import type { TabId } from '../../../../../domain/state/ui/ui-state';

export enum AppRibbonActionType {
  TabButtonOnClick = 'APP_RIBBON_TAB_BUTTON_ON_CLICK',
}

export type AppRibbonActions =
  | { type: AppRibbonActionType.TabButtonOnClick; tabId: TabId };

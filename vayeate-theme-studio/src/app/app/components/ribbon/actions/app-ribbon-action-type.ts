import type { TabId } from '../../../../../domain/state/ui/ui-state';
import type { AppAction } from '../../../../core/action-queue/app-action';

export enum AppRibbonActionType {
  TabButtonOnClick = 'APP_RIBBON_TAB_BUTTON_ON_CLICK',
}

export type AppRibbonActions =
  | { type: AppRibbonActionType.TabButtonOnClick; tabId: TabId };


const appRibbonTypes = new Set<string>(Object.values(AppRibbonActionType));

export function isAppRibbonAction(a: AppAction): a is AppRibbonActions {
  return appRibbonTypes.has(a.type);
}

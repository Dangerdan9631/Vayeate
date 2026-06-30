import type { TabId } from '../../../../model/app-ui';
import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type strings for ribbon tab controls.
 */
export enum AppRibbonActionType {
  TabButtonOnClick = 'APP_RIBBON_TAB_BUTTON_ON_CLICK',
}

/**
 * Discriminated union of ribbon actions dispatched from tab buttons.
 */
export type AppRibbonActions =
  | { type: AppRibbonActionType.TabButtonOnClick; tabId: TabId };


/**
 * Set of ribbon action type strings used by the {@link isAppRibbonAction} guard.
 */
const appRibbonTypes = new Set<string>(Object.values(AppRibbonActionType));

/**
 * Narrows a queued action to a ribbon action when its type is ribbon-scoped.
 * @param a Action from the global action queue.
 * @returns True when the action belongs to {@link AppRibbonActions}.
 */
export function isAppRibbonAction(a: AppAction): a is AppRibbonActions {
  return appRibbonTypes.has(a.type);
}

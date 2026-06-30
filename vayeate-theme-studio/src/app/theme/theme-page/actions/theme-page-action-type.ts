import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type literals dispatched from the Theme Page.
 */
export enum ThemePageActionType {
  PageOnLoad = 'THEME_PAGE_ON_LOAD',
  PageSaveErrorDismissButtonOnClick = 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK',
}

/**
 * Union of actions handled by the Theme Page.
 */
export type ThemePageActions =
  | { type: ThemePageActionType.PageOnLoad }
  | { type: ThemePageActionType.PageSaveErrorDismissButtonOnClick };


const themePageTypes = new Set<string>(Object.values(ThemePageActionType));

/**
 * Returns whether the app action belongs to the Theme Page.
 * @param a Input for this call.
 */
export function isThemePageAction(a: AppAction): a is ThemePageActions {
  return themePageTypes.has(a.type);
}

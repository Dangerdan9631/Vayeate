export enum ThemePageActionType {
  PageOnLoad = 'THEME_PAGE_ON_LOAD',
  PageSaveErrorDismissButtonOnClick = 'THEME_PAGE_SAVE_ERROR_DISMISS_BUTTON_ON_CLICK',
}

export type ThemePageActions =
  | { type: ThemePageActionType.PageOnLoad }
  | { type: ThemePageActionType.PageSaveErrorDismissButtonOnClick };

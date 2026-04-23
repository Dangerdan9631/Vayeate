export enum AppBarActionType {
  ThemeCheckboxOnToggle = 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE',
  MinimizeButtonOnClick = 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK',
  MaximizeButtonOnClick = 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK',
  RestoreButtonOnClick = 'APP_BAR_RESTORE_BUTTON_ON_CLICK',
  CloseButtonOnClick = 'APP_BAR_CLOSE_BUTTON_ON_CLICK',
  TitleBarOnDrag = 'APP_BAR_TITLE_BAR_ON_DRAG',
}

export type AppBarActions =
  | { type: AppBarActionType.ThemeCheckboxOnToggle }
  | { type: AppBarActionType.MinimizeButtonOnClick }
  | { type: AppBarActionType.MaximizeButtonOnClick }
  | { type: AppBarActionType.RestoreButtonOnClick }
  | { type: AppBarActionType.CloseButtonOnClick }
  | { type: AppBarActionType.TitleBarOnDrag };

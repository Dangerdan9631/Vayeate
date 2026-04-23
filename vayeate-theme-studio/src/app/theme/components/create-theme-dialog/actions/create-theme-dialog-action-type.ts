import type { ThemeName } from '../../../../../model/schema/primitives';

export enum CreateThemeDialogActionType {
  NameTextOnChange = 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

export type CreateThemeDialogActions =
  | { type: CreateThemeDialogActionType.NameTextOnChange; value: string }
  | { type: CreateThemeDialogActionType.CancelButtonOnClick }
  | { type: CreateThemeDialogActionType.OkButtonOnClick; params: { name: ThemeName } };

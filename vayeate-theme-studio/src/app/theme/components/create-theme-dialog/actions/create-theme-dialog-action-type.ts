import type { ThemeName } from '../../../../../model/schema/primitives';
import type { AppAction } from '../../../../core/components/action-queue/app-action';

export enum CreateThemeDialogActionType {
  NameTextOnChange = 'THEME_CREATE_DIALOG_NAME_TEXT_ON_CHANGE',
  CancelButtonOnClick = 'THEME_CREATE_DIALOG_CANCEL_BUTTON_ON_CLICK',
  OkButtonOnClick = 'THEME_CREATE_DIALOG_OK_BUTTON_ON_CLICK',
}

export type CreateThemeDialogActions =
  | { type: CreateThemeDialogActionType.NameTextOnChange; value: string }
  | { type: CreateThemeDialogActionType.CancelButtonOnClick }
  | { type: CreateThemeDialogActionType.OkButtonOnClick; params: { name: ThemeName } };


const createThemeDialogTypes = new Set<string>(Object.values(CreateThemeDialogActionType));

export function isCreateThemeDialogAction(a: AppAction): a is CreateThemeDialogActions {
  return createThemeDialogTypes.has(a.type);
}

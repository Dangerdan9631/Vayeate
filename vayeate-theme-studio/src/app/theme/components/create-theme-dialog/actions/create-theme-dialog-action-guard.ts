import type { AppAction } from '../../../../core/actions/app-action';
import { CreateThemeDialogActions, CreateThemeDialogActionType } from './create-theme-dialog-action-type';

const createThemeDialogTypes = new Set<string>(Object.values(CreateThemeDialogActionType));

export function isCreateThemeDialogAction(a: AppAction): a is CreateThemeDialogActions {
  return createThemeDialogTypes.has(a.type);
}

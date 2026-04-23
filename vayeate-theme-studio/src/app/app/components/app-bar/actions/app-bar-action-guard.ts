import type { AppAction } from '../../../../core/actions/app-action';
import { AppBarActions, AppBarActionType } from './app-bar-action-type';

const appBarTypes = new Set<string>(Object.values(AppBarActionType));

export function isAppBarAction(a: AppAction): a is AppBarActions {
  return appBarTypes.has(a.type);
}

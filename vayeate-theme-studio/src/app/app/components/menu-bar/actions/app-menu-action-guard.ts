import type { AppAction } from '../../../../core/actions/app-action';
import { AppMenuActions, AppMenuActionType } from './app-menu-action-type';

const appMenuTypes = new Set<string>(Object.values(AppMenuActionType));

export function isAppMenuAction(a: AppAction): a is AppMenuActions {
  return appMenuTypes.has(a.type);
}

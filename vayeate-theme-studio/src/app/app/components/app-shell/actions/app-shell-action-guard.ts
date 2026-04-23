import type { AppAction } from '../../../../core/actions/app-action';
import { AppShellActions, AppShellActionType } from './app-shell-action-type';

const appShellTypes = new Set<string>(Object.values(AppShellActionType));

export function isAppShellAction(a: AppAction): a is AppShellActions {
  return appShellTypes.has(a.type);
}

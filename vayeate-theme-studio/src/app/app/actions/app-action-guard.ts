import type { AppAction } from '../../core/actions/app-action';
import type { AppActions } from './app-action-type';
import { AppActionType } from './app-action-type';

const appTypes = new Set<string>(Object.values(AppActionType));

export function isAppAction(a: AppAction): a is AppActions {
  return appTypes.has(a.type);
}

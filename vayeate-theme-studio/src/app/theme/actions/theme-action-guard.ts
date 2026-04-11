import type { AppAction } from '../../core/actions/app-action';
import type { ThemeActions } from './theme-action-type';
import { ThemeActionType } from './theme-action-type';

const themeTypes = new Set<string>(Object.values(ThemeActionType));

export function isThemeAction(a: AppAction): a is ThemeActions {
  return themeTypes.has(a.type);
}

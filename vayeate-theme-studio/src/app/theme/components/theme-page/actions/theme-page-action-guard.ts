import type { AppAction } from '../../../../core/actions/app-action';
import { ThemePageActions, ThemePageActionType } from './theme-page-action-type';

const themePageTypes = new Set<string>(Object.values(ThemePageActionType));

export function isThemePageAction(a: AppAction): a is ThemePageActions {
  return themePageTypes.has(a.type);
}

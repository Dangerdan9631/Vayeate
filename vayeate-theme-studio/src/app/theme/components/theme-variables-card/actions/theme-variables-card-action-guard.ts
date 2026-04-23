import type { AppAction } from '../../../../core/actions/app-action';
import { ThemeVariablesCardActions, ThemeVariablesCardActionType } from './theme-variables-card-action-type';

const themeVariablesCardTypes = new Set<string>(Object.values(ThemeVariablesCardActionType));

export function isThemeVariablesCardAction(a: AppAction): a is ThemeVariablesCardActions {
  return themeVariablesCardTypes.has(a.type);
}

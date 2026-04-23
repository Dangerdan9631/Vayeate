import type { AppAction } from '../../../../core/actions/app-action';
import { ThemeDetailsCardActions, ThemeDetailsCardActionType } from './theme-details-card-action-type';

const themeDetailsCardTypes = new Set<string>(Object.values(ThemeDetailsCardActionType));

export function isThemeDetailsCardAction(a: AppAction): a is ThemeDetailsCardActions {
  return themeDetailsCardTypes.has(a.type);
}

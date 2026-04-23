import type { AppAction } from '../../../../core/actions/app-action';
import { ThemesCardActions, ThemesCardActionType } from './themes-card-action-type';

const themesCardTypes = new Set<string>(Object.values(ThemesCardActionType));

export function isThemesCardAction(a: AppAction): a is ThemesCardActions {
  return themesCardTypes.has(a.type);
}

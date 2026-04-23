import type { AppAction } from '../../../../core/actions/app-action';
import { AppRibbonActions, AppRibbonActionType } from './app-ribbon-action-type';

const appRibbonTypes = new Set<string>(Object.values(AppRibbonActionType));

export function isAppRibbonAction(a: AppAction): a is AppRibbonActions {
  return appRibbonTypes.has(a.type);
}

import type { AppAction } from '../../../../core/actions/app-action';
import { ThemePaletteCardActions, ThemePaletteCardActionType } from './theme-palette-card-action-type';

const themePaletteCardTypes = new Set<string>(Object.values(ThemePaletteCardActionType));

export function isThemePaletteCardAction(a: AppAction): a is ThemePaletteCardActions {
  return themePaletteCardTypes.has(a.type);
}

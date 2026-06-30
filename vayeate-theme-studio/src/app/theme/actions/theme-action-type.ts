import type { CreateThemeDialogActions } from '../create-theme-dialog/actions/create-theme-dialog-action-type';
import type { EditorPreviewsCardActions } from '../editor-previews-card/actions/editor-previews-card-action-type';
import type { ThemeDetailsCardActions } from '../theme-details-card/actions/theme-details-card-action-type';
import type { ThemePageActions } from '../theme-page/actions/theme-page-action-type';
import type { ThemePaletteCardActions } from '../theme-palette-card/actions/theme-palette-card-action-type';
import type { ThemesCardActions } from '../themes-card/actions/themes-card-action-type';
import type { ThemeVariablesCardActions } from '../theme-variables-card/actions/theme-variables-card-action-type';
import type { AppAction } from '../../core/action-queue/app-action';
import { isCreateThemeDialogAction, tryCoalesceCreateThemeDialogAction } from '../create-theme-dialog/actions/create-theme-dialog-action-type';
import { isEditorPreviewsCardAction } from '../editor-previews-card/actions/editor-previews-card-action-type';
import { isThemeDetailsCardAction } from '../theme-details-card/actions/theme-details-card-action-type';
import { isThemePageAction } from '../theme-page/actions/theme-page-action-type';
import { isThemePaletteCardAction, tryCoalesceThemePaletteCardAction } from '../theme-palette-card/actions/theme-palette-card-action-type';
import { isThemesCardAction } from '../themes-card/actions/themes-card-action-type';
import { isThemeVariablesCardAction, tryCoalesceThemeVariablesCardAction } from '../theme-variables-card/actions/theme-variables-card-action-type';

/**
 * Union of actions handled by the theme UI domain.
 */
export type ThemeActions =
  | CreateThemeDialogActions
  | EditorPreviewsCardActions
  | ThemeDetailsCardActions
  | ThemePageActions
  | ThemePaletteCardActions
  | ThemesCardActions
  | ThemeVariablesCardActions;


/**
 * Returns whether the app action belongs to the theme UI domain.
 * @param a Candidate action from the app queue.
 * @returns True when the action is part of the theme UI union.
 */
export function isThemeAction(a: AppAction): a is ThemeActions {
  return isCreateThemeDialogAction(a)
    || isEditorPreviewsCardAction(a)
    || isThemeDetailsCardAction(a)
    || isThemePageAction(a)
    || isThemePaletteCardAction(a)
    || isThemesCardAction(a)
    || isThemeVariablesCardAction(a);
}

/**
 * Coalesces consecutive theme UI actions when the action queue merges duplicate streams.
 * @param pending Input for this call.
 * @param incoming Input for this call.
 * @returns Coalesced action, or null when coalescing does not apply.
 */
export function tryCoalesceThemeAction(pending: AppAction, incoming: AppAction): ThemeActions | null {
  if (isCreateThemeDialogAction(pending) && isCreateThemeDialogAction(incoming)) {
    return tryCoalesceCreateThemeDialogAction(pending, incoming);
  }
  if (isThemePaletteCardAction(pending) && isThemePaletteCardAction(incoming)) {
    return tryCoalesceThemePaletteCardAction(pending, incoming);
  }
  if (isThemeVariablesCardAction(pending) && isThemeVariablesCardAction(incoming)) {
    return tryCoalesceThemeVariablesCardAction(pending, incoming);
  }
  return null;
}

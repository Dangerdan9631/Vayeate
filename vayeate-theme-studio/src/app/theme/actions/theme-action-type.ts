import type { CreateThemeDialogActions } from '../create-theme-dialog/actions/create-theme-dialog-action-type';
import type { EditorPreviewsCardActions } from '../editor-previews-card/actions/editor-previews-card-action-type';
import type { ThemeDetailsCardActions } from '../theme-details-card/actions/theme-details-card-action-type';
import type { ThemePageActions } from '../theme-page/actions/theme-page-action-type';
import type { ThemePaletteCardActions } from '../theme-palette-card/actions/theme-palette-card-action-type';
import type { ThemesCardActions } from '../themes-card/actions/themes-card-action-type';
import type { ThemeVariablesCardActions } from '../theme-variables-card/actions/theme-variables-card-action-type';
import type { AppAction } from '../../core/action-queue/app-action';
import { isCreateThemeDialogAction } from '../create-theme-dialog/actions/create-theme-dialog-action-type';
import { isEditorPreviewsCardAction } from '../editor-previews-card/actions/editor-previews-card-action-type';
import { isThemeDetailsCardAction } from '../theme-details-card/actions/theme-details-card-action-type';
import { isThemePageAction } from '../theme-page/actions/theme-page-action-type';
import { isThemePaletteCardAction } from '../theme-palette-card/actions/theme-palette-card-action-type';
import { isThemesCardAction } from '../themes-card/actions/themes-card-action-type';
import { isThemeVariablesCardAction } from '../theme-variables-card/actions/theme-variables-card-action-type';

export type ThemeActions =
  | CreateThemeDialogActions
  | EditorPreviewsCardActions
  | ThemeDetailsCardActions
  | ThemePageActions
  | ThemePaletteCardActions
  | ThemesCardActions
  | ThemeVariablesCardActions;


export function isThemeAction(a: AppAction): a is ThemeActions {
  return isCreateThemeDialogAction(a)
    || isEditorPreviewsCardAction(a)
    || isThemeDetailsCardAction(a)
    || isThemePageAction(a)
    || isThemePaletteCardAction(a)
    || isThemesCardAction(a)
    || isThemeVariablesCardAction(a);
}

import type { CreateThemeDialogActions } from '../components/create-theme-dialog/actions/create-theme-dialog-action-type';
import type { EditorPreviewsCardActions } from '../components/editor-previews-card/actions/editor-previews-card-action-type';
import type { ThemeDetailsCardActions } from '../components/theme-details-card/actions/theme-details-card-action-type';
import type { ThemePageActions } from '../components/theme-page/actions/theme-page-action-type';
import type { ThemePaletteCardActions } from '../components/theme-palette-card/actions/theme-palette-card-action-type';
import type { ThemesCardActions } from '../components/themes-card/actions/themes-card-action-type';
import type { ThemeVariablesCardActions } from '../components/theme-variables-card/actions/theme-variables-card-action-type';
import type { AppAction } from '../../core/actions/app-action';
import { isCreateThemeDialogAction } from '../components/create-theme-dialog/actions/create-theme-dialog-action-type';
import { isEditorPreviewsCardAction } from '../components/editor-previews-card/actions/editor-previews-card-action-type';
import { isThemeDetailsCardAction } from '../components/theme-details-card/actions/theme-details-card-action-type';
import { isThemePageAction } from '../components/theme-page/actions/theme-page-action-type';
import { isThemePaletteCardAction } from '../components/theme-palette-card/actions/theme-palette-card-action-type';
import { isThemesCardAction } from '../components/themes-card/actions/themes-card-action-type';
import { isThemeVariablesCardAction } from '../components/theme-variables-card/actions/theme-variables-card-action-type';

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

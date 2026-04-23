import type { AppAction } from '../../core/actions/app-action';
import { isCreateThemeDialogAction } from '../components/create-theme-dialog/actions/create-theme-dialog-action-guard';
import { isEditorPreviewsCardAction } from '../components/editor-previews-card/actions/editor-previews-card-action-guard';
import { isThemeDetailsCardAction } from '../components/theme-details-card/actions/theme-details-card-action-guard';
import { isThemePageAction } from '../components/theme-page/actions/theme-page-action-guard';
import { isThemePaletteCardAction } from '../components/theme-palette-card/actions/theme-palette-card-action-guard';
import { isThemesCardAction } from '../components/themes-card/actions/themes-card-action-guard';
import { isThemeVariablesCardAction } from '../components/theme-variables-card/actions/theme-variables-card-action-guard';
import type { ThemeActions } from './theme-action-type';

export function isThemeAction(a: AppAction): a is ThemeActions {
  return isCreateThemeDialogAction(a)
    || isEditorPreviewsCardAction(a)
    || isThemeDetailsCardAction(a)
    || isThemePageAction(a)
    || isThemePaletteCardAction(a)
    || isThemesCardAction(a)
    || isThemeVariablesCardAction(a);
}

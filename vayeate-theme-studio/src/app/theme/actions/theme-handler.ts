import { delay, inject, singleton } from 'tsyringe';
import { ThemeActions } from './theme-action-type';
import { CreateThemeDialogHandler } from '../components/create-theme-dialog/actions/create-theme-dialog-handler';
import { isCreateThemeDialogAction } from '../components/create-theme-dialog/actions/create-theme-dialog-action-guard';
import { EditorPreviewsCardHandler } from '../components/editor-previews-card/actions/editor-previews-card-handler';
import { isEditorPreviewsCardAction } from '../components/editor-previews-card/actions/editor-previews-card-action-guard';
import { ThemeDetailsCardHandler } from '../components/theme-details-card/actions/theme-details-card-handler';
import { isThemeDetailsCardAction } from '../components/theme-details-card/actions/theme-details-card-action-guard';
import { ThemePageHandler } from '../components/theme-page/actions/theme-page-handler';
import { isThemePageAction } from '../components/theme-page/actions/theme-page-action-guard';
import { ThemePaletteCardHandler } from '../components/theme-palette-card/actions/theme-palette-card-handler';
import { isThemePaletteCardAction } from '../components/theme-palette-card/actions/theme-palette-card-action-guard';
import { ThemesCardHandler } from '../components/themes-card/actions/themes-card-handler';
import { isThemesCardAction } from '../components/themes-card/actions/themes-card-action-guard';
import { ThemeVariablesCardHandler } from '../components/theme-variables-card/actions/theme-variables-card-handler';
import { isThemeVariablesCardAction } from '../components/theme-variables-card/actions/theme-variables-card-action-guard';
import { Logger, LoggerFactory } from '../../../domain/utils/logger';

@singleton()
export class ThemeActionHandler {
  private readonly log: Logger;

  constructor(
    loggerFactory: LoggerFactory,
    @inject(delay(() => CreateThemeDialogHandler)) private readonly createThemeDialogHandler: CreateThemeDialogHandler,
    @inject(delay(() => EditorPreviewsCardHandler)) private readonly editorPreviewsCardHandler: EditorPreviewsCardHandler,
    @inject(delay(() => ThemeDetailsCardHandler)) private readonly themeDetailsCardHandler: ThemeDetailsCardHandler,
    @inject(delay(() => ThemePageHandler)) private readonly themePageHandler: ThemePageHandler,
    @inject(delay(() => ThemePaletteCardHandler)) private readonly themePaletteCardHandler: ThemePaletteCardHandler,
    @inject(delay(() => ThemesCardHandler)) private readonly themesCardHandler: ThemesCardHandler,
    @inject(delay(() => ThemeVariablesCardHandler)) private readonly themeVariablesCardHandler: ThemeVariablesCardHandler,
  ) {
    this.log = loggerFactory.create(ThemeActionHandler.name);
  }

  async handle(action: ThemeActions): Promise<void> {
    if (isCreateThemeDialogAction(action)) {
      return this.createThemeDialogHandler.handle(action);
    }

    if (isEditorPreviewsCardAction(action)) {
      return this.editorPreviewsCardHandler.handle(action);
    }

    if (isThemeDetailsCardAction(action)) {
      return this.themeDetailsCardHandler.handle(action);
    }

    if (isThemePageAction(action)) {
      return this.themePageHandler.handle(action);
    }

    if (isThemePaletteCardAction(action)) {
      return this.themePaletteCardHandler.handle(action);
    }

    if (isThemesCardAction(action)) {
      return this.themesCardHandler.handle(action);
    }

    if (isThemeVariablesCardAction(action)) {
      return this.themeVariablesCardHandler.handle(action);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemeAction union not exhaustive)', { action: _exhaustive });
  }
}

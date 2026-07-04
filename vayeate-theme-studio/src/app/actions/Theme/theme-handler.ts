import { delay, inject, singleton } from 'tsyringe';
import { ThemeActions } from './theme-action-type';
import { CreateThemeDialogHandler } from './create-theme-dialog/create-theme-dialog-handler';
import { isCreateThemeDialogAction } from './create-theme-dialog/create-theme-dialog-action-type';
import { EditorPreviewsCardHandler } from './editor-previews-card/editor-previews-card-handler';
import { isEditorPreviewsCardAction } from './editor-previews-card/editor-previews-card-action-type';
import { ThemeDetailsCardHandler } from './theme-details-card/theme-details-card-handler';
import { isThemeDetailsCardAction } from './theme-details-card/theme-details-card-action-type';
import { ThemePageHandler } from './theme-page/theme-page-handler';
import { isThemePageAction } from './theme-page/theme-page-action-type';
import { ThemePaletteCardHandler } from './theme-palette-card/theme-palette-card-handler';
import { isThemePaletteCardAction } from './theme-palette-card/theme-palette-card-action-type';
import { ThemesCardHandler } from './themes-card/themes-card-handler';
import { isThemesCardAction } from './themes-card/themes-card-action-type';
import { ThemeVariablesCardHandler } from './theme-variables-card/theme-variables-card-handler';
import { isThemeVariablesCardAction } from './theme-variables-card/theme-variables-card-action-type';
import { Logger, LoggerFactory } from '../../../domain/utils/Common/logger';

/**
 * Routes theme UI actions to their controllers.
 */
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

  /**
 * Dispatches the action to the matching controller.
 * @param action Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
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

import { singleton } from 'tsyringe';
import { LoadThemePreviewsController } from '../controllers/load-theme-previews-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { EditorPreviewsCardActions, EditorPreviewsCardActionType } from './editor-previews-card-action-type';

@singleton()
export class EditorPreviewsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly loadThemePreviews: LoadThemePreviewsController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(EditorPreviewsCardHandler.name);
  }

  async handle(action: EditorPreviewsCardActions): Promise<void> {
    switch (action.type) {
      case EditorPreviewsCardActionType.PagePreviewsOnLoad:
        return this.loadThemePreviews.run();
    }

    this.log.error('Unhandled action (EditorPreviewsCardAction union not exhaustive)', { action });
  }
}

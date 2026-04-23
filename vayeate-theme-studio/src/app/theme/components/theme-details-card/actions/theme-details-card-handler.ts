import { singleton } from 'tsyringe';
import { DeleteThemeVersionController } from '../../../controllers/delete-theme-version-controller';
import { GenerateThemeController } from '../../../controllers/generate-theme-controller';
import { IncrementThemeVersionController } from '../../../controllers/increment-theme-version-controller';
import { SetThemePreviewTokenRefController } from '../../../controllers/set-theme-preview-token-ref-controller';
import { SetThemeTemplateController } from '../../../controllers/set-theme-template-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { ThemeDetailsCardActions, ThemeDetailsCardActionType } from './theme-details-card-action-type';

@singleton()
export class ThemeDetailsCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly deleteThemeVersion: DeleteThemeVersionController,
    private readonly generateTheme: GenerateThemeController,
    private readonly incrementThemeVersion: IncrementThemeVersionController,
    private readonly setThemePreviewTokenRef: SetThemePreviewTokenRefController,
    private readonly setThemeTemplate: SetThemeTemplateController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemeDetailsCardHandler.name);
  }

  async handle(action: ThemeDetailsCardActions): Promise<void> {
    switch (action.type) {
      case ThemeDetailsCardActionType.TemplateListOnCommit:
        return this.setThemeTemplate.run(action.name, action.version);
      case ThemeDetailsCardActionType.TemplateVersionListOnCommit:
        return this.setThemeTemplate.run(action.name, action.version);
      case ThemeDetailsCardActionType.DeleteVersionButtonOnClick:
        return this.deleteThemeVersion.run(action.name, action.version);
      case ThemeDetailsCardActionType.IncrementVersionButtonOnClick:
        return this.incrementThemeVersion.run();
      case ThemeDetailsCardActionType.GenerateButtonOnClick:
        return this.generateTheme.run();
      case ThemeDetailsCardActionType.PreviewTokenRefListOnCommit:
        return this.setThemePreviewTokenRef.run(action.tokenRefField, action.value);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemeDetailsCardAction union not exhaustive)', { action: _exhaustive });
  }
}

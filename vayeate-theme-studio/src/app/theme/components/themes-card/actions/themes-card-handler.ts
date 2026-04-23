import { singleton } from 'tsyringe';
import { OpenThemeCreateDialogController } from '../../../controllers/open-theme-create-dialog-controller';
import { SelectThemeAndLoadController } from '../../../controllers/select-theme-and-load-controller';
import { SelectThemeByNameController } from '../../../controllers/select-theme-by-name-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { ThemesCardActions, ThemesCardActionType } from './themes-card-action-type';

@singleton()
export class ThemesCardHandler {
  private readonly log: Logger;

  constructor(
    private readonly openThemeCreateDialog: OpenThemeCreateDialogController,
    private readonly selectThemeAndLoad: SelectThemeAndLoadController,
    private readonly selectThemeByName: SelectThemeByNameController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(ThemesCardHandler.name);
  }

  async handle(action: ThemesCardActions): Promise<void> {
    switch (action.type) {
      case ThemesCardActionType.NameListOnCommit:
        return this.selectThemeByName.run(action.name);
      case ThemesCardActionType.VersionListOnCommit:
        return this.selectThemeAndLoad.run(action.name, action.version);
      case ThemesCardActionType.CreateButtonOnClick:
        return this.openThemeCreateDialog.run();
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (ThemesCardAction union not exhaustive)', { action: _exhaustive });
  }
}

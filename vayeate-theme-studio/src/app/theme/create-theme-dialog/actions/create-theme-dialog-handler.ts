import { singleton } from 'tsyringe';
import { CloseThemeCreateDialogController } from '../controllers/close-theme-create-dialog-controller';
import { CreateThemeController } from '../controllers/create-theme-controller';
import { SetThemeCreateFormNameController } from '../controllers/set-theme-create-form-name-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { CreateThemeDialogActions, CreateThemeDialogActionType } from './create-theme-dialog-action-type';

/**
 * Routes Create Theme Dialog actions to their controllers.
 */
@singleton()
export class CreateThemeDialogHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeThemeCreateDialog: CloseThemeCreateDialogController,
    private readonly createTheme: CreateThemeController,
    private readonly setThemeCreateFormName: SetThemeCreateFormNameController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(CreateThemeDialogHandler.name);
  }

  /**
 * Dispatches the action to the matching controller.
 * @param action Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  async handle(action: CreateThemeDialogActions): Promise<void> {
    switch (action.type) {
      case CreateThemeDialogActionType.NameTextOnChange:
        return this.setThemeCreateFormName.run(action.value);
      case CreateThemeDialogActionType.CancelButtonOnClick:
        return this.closeThemeCreateDialog.run();
      case CreateThemeDialogActionType.OkButtonOnClick:
        return this.createTheme.run(action.params);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (CreateThemeDialogAction union not exhaustive)', { action: _exhaustive });
  }
}

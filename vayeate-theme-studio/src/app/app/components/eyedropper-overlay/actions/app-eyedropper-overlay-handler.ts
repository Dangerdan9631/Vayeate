import { singleton } from 'tsyringe';
import { CloseEyedropperOverlayController } from '../../../../theme/controllers/close-eyedropper-overlay-controller';
import { CommitEyedropperOverlayPickController } from '../../../../theme/controllers/commit-eyedropper-overlay-pick-controller';
import { Logger, LoggerFactory } from '../../../../../domain/utils/logger';
import { AppEyedropperOverlayActions, AppEyedropperOverlayActionType } from './app-eyedropper-overlay-action-type';

@singleton()
export class AppEyedropperOverlayHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly commitEyedropperOverlayPick: CommitEyedropperOverlayPickController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(AppEyedropperOverlayHandler.name);
  }

  async handle(action: AppEyedropperOverlayActions): Promise<void> {
    switch (action.type) {
      case AppEyedropperOverlayActionType.CancelButtonOnClick:
        return this.closeEyedropperOverlay.run();
      case AppEyedropperOverlayActionType.ColorPickCommitButtonOnClick:
        return this.commitEyedropperOverlayPick.run(action.hex);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppEyedropperOverlayAction union not exhaustive)', { action: _exhaustive });
  }
}

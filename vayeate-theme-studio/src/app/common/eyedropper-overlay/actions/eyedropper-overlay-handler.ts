import { singleton } from 'tsyringe';
import { CloseEyedropperOverlayController } from '../controllers/close-eyedropper-overlay-controller';
import { CommitEyedropperOverlayPickController } from '../controllers/commit-eyedropper-overlay-pick-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { AppEyedropperOverlayActions, EyedropperOverlayActionType } from './eyedropper-overlay-action-type';

@singleton()
export class EyedropperOverlayHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly commitEyedropperOverlayPick: CommitEyedropperOverlayPickController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(EyedropperOverlayHandler.name);
  }

  async handle(action: AppEyedropperOverlayActions): Promise<void> {
    switch (action.type) {
      case EyedropperOverlayActionType.CancelButtonOnClick:
        return this.closeEyedropperOverlay.run();
      case EyedropperOverlayActionType.ColorPickCommitButtonOnClick:
        return this.commitEyedropperOverlayPick.run(action.hex);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppEyedropperOverlayAction union not exhaustive)', { action: _exhaustive });
  }
}

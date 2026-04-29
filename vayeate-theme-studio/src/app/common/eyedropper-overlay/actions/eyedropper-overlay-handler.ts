import { singleton } from 'tsyringe';
import { CloseEyedropperOverlayController } from '../controllers/close-eyedropper-overlay-controller';
import { EyedropperOverlayWheelScrollController } from '../controllers/eyedropper-overlay-wheel-scroll-controller';
import { EyedropperOverlayMouseMoveController } from '../controllers/eyedropper-overlay-mouse-move-controller';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { AppEyedropperOverlayActions, EyedropperOverlayActionType } from './eyedropper-overlay-action-type';
import { EyedropperOverlayViewportSizeChangeController } from '../controllers/eyedropper-overlay-viewport-size-change-controller';

@singleton()
export class EyedropperOverlayHandler {
  private readonly log: Logger;

  constructor(
    private readonly closeEyedropperOverlay: CloseEyedropperOverlayController,
    private readonly eyedropperOverlayWheelScroll: EyedropperOverlayWheelScrollController,
    private readonly eyedropperOverlayMouseMove: EyedropperOverlayMouseMoveController,
    private readonly eyedropperOverlayViewportSizeChange: EyedropperOverlayViewportSizeChangeController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(EyedropperOverlayHandler.name);
  }

  async handle(action: AppEyedropperOverlayActions): Promise<void> {
    switch (action.type) {
      case EyedropperOverlayActionType.CancelButtonOnClick:
        return this.closeEyedropperOverlay.run(null);
      case EyedropperOverlayActionType.ColorPickCommitButtonOnClick:
        return this.closeEyedropperOverlay.run(action.hex);
      case EyedropperOverlayActionType.OverlayWheelOnScroll:
        return this.eyedropperOverlayWheelScroll.run(action.deltaY);
      case EyedropperOverlayActionType.OverlayMouseMove:
        return this.eyedropperOverlayMouseMove.run(action.pointer);
      case EyedropperOverlayActionType.OverlayViewportSizeChange:
        return this.eyedropperOverlayViewportSizeChange.run(action.size);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppEyedropperOverlayAction union not exhaustive)', { action: _exhaustive });
  }
}

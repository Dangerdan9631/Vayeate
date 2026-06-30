import { singleton } from 'tsyringe';
import { Logger, LoggerFactory } from '../../../../domain/utils/logger';
import { HideStyledTooltipController } from '../controllers/hide-styled-tooltip-controller';
import { RepositionStyledTooltipController } from '../controllers/reposition-styled-tooltip-controller';
import { ShowStyledTooltipController } from '../controllers/show-styled-tooltip-controller';
import { AppStyledTooltipActions, StyledTooltipActionType } from './styled-tooltip-action-type';

/**
 * Routes styled tooltip actions to their dedicated controllers.
 */
@singleton()
export class StyledTooltipHandler {
  private readonly log: Logger;

  constructor(
    private readonly showStyledTooltip: ShowStyledTooltipController,
    private readonly hideStyledTooltip: HideStyledTooltipController,
    private readonly repositionStyledTooltip: RepositionStyledTooltipController,
    loggerFactory: LoggerFactory,
  ) {
    this.log = loggerFactory.create(StyledTooltipHandler.name);
  }

  /**
   * Dispatches one styled tooltip action to the matching controller entry point.
   * @param action Typed styled tooltip action from the queue.
   * @returns A promise that settles when the controller run completes.
   */
  async handle(action: AppStyledTooltipActions): Promise<void> {
    switch (action.type) {
      case StyledTooltipActionType.TooltipSourceOnMouseOver:
        return this.showStyledTooltip.run(action.tooltip);
      case StyledTooltipActionType.TooltipSourceOnMouseOut:
        return this.hideStyledTooltip.run();
      case StyledTooltipActionType.TooltipOnPositionChange:
        return this.repositionStyledTooltip.run(action.position);
    }

    const _exhaustive: never = action;
    this.log.error('Unhandled action (AppStyledTooltipAction union not exhaustive)', { action: _exhaustive });
  }
}

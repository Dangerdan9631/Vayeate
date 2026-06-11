import { singleton } from 'tsyringe';
import { HideStyledTooltipOperation } from '../../../../domain/operations/app-operations/hide-styled-tooltip-operation';

/**
 * Hides the global styled tooltip when the pointer leaves its source.
 */
@singleton()
export class HideStyledTooltipController {
  constructor(private readonly hideTooltip: HideStyledTooltipOperation) {}

  /**
   * Clears tooltip UI state.
   * @returns Nothing.
   */
  run(): void {
    this.hideTooltip.execute();
  }
}

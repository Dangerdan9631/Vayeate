import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import { ShowStyledTooltipOperation } from '../../../../domain/operations/app-operations/show-styled-tooltip-operation';

/**
 * Shows the global styled tooltip from a hover-source action.
 */
@singleton()
export class ShowStyledTooltipController {
  constructor(private readonly showTooltip: ShowStyledTooltipOperation) {}

  /**
   * Writes tooltip text and initial position into UI state.
   * @param tooltip Tooltip content and anchor coordinates.
   * @returns Nothing.
   */
  run(tooltip: StyledTooltipState): void {
    this.showTooltip.execute(tooltip);
  }
}

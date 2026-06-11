import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import { RepositionStyledTooltipOperation } from '../../../../domain/operations/app-operations/reposition-styled-tooltip-operation';

/**
 * Repositions the visible styled tooltip after layout measurement.
 */
@singleton()
export class RepositionStyledTooltipController {
  constructor(private readonly repositionTooltip: RepositionStyledTooltipOperation) {}

  /**
   * Updates tooltip screen coordinates in UI state.
   * @param position Clamped x/y position for the tooltip element.
   * @returns Nothing.
   */
  run(position: Pick<StyledTooltipState, 'x' | 'y'>): void {
    this.repositionTooltip.execute(position);
  }
}

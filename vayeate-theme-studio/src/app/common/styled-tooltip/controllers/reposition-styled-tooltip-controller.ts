import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import { RepositionStyledTooltipOperation } from '../../../../domain/operations/app-operations/reposition-styled-tooltip-operation';

@singleton()
export class RepositionStyledTooltipController {
  constructor(private readonly repositionTooltip: RepositionStyledTooltipOperation) {}

  run(position: Pick<StyledTooltipState, 'x' | 'y'>): void {
    this.repositionTooltip.execute(position);
  }
}

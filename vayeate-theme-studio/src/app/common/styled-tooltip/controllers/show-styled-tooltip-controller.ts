import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import { ShowStyledTooltipOperation } from '../../../../domain/operations/app-operations/show-styled-tooltip-operation';

@singleton()
export class ShowStyledTooltipController {
  constructor(private readonly showTooltip: ShowStyledTooltipOperation) {}

  run(tooltip: StyledTooltipState): void {
    this.showTooltip.execute(tooltip);
  }
}

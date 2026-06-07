import { singleton } from 'tsyringe';
import { HideStyledTooltipOperation } from '../../../../domain/operations/app-operations/hide-styled-tooltip-operation';

@singleton()
export class HideStyledTooltipController {
  constructor(private readonly hideTooltip: HideStyledTooltipOperation) {}

  run(): void {
    this.hideTooltip.execute();
  }
}

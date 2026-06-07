import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../model/styled-tooltip';
import { StyledTooltipUiStore } from '../../state/ui/styled-tooltip-ui-store';

@singleton()
export class ShowStyledTooltipOperation {
  constructor(private readonly tooltipStore: StyledTooltipUiStore) {}

  execute(tooltip: StyledTooltipState): void {
    this.tooltipStore.getStore().showTooltip(tooltip);
  }
}

import { singleton } from 'tsyringe';
import { StyledTooltipUiStore } from '../../state/ui/styled-tooltip-ui-store';

@singleton()
export class HideStyledTooltipOperation {
  constructor(private readonly tooltipStore: StyledTooltipUiStore) {}

  execute(): void {
    this.tooltipStore.getStore().hideTooltip();
  }
}

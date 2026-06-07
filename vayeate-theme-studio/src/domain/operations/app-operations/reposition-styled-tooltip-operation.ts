import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../model/styled-tooltip';
import { StyledTooltipUiStore } from '../../state/ui/styled-tooltip-ui-store';

@singleton()
export class RepositionStyledTooltipOperation {
  constructor(private readonly tooltipStore: StyledTooltipUiStore) {}

  execute(position: Pick<StyledTooltipState, 'x' | 'y'>): void {
    this.tooltipStore.getStore().repositionTooltip(position);
  }
}

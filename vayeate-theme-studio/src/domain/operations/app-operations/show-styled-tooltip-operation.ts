import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../model/styled-tooltip';
import { StyledTooltipUiStore } from '../../state/ui/styled-tooltip-ui-store';

/**
 * Shows styled tooltip in the UI store.
 */

@singleton()
export class ShowStyledTooltipOperation {
  constructor(private readonly tooltipStore: StyledTooltipUiStore) {}

  /**
   * Runs the show styled tooltip mutation.
   * @param tooltip Tooltip (StyledTooltipState).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(tooltip: StyledTooltipState): void {
    this.tooltipStore.getStore().showTooltip(tooltip);
  }
}

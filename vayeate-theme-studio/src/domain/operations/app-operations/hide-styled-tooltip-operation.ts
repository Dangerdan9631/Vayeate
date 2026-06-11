import { singleton } from 'tsyringe';
import { StyledTooltipUiStore } from '../../state/ui/styled-tooltip-ui-store';

/**
 * Hides styled tooltip in the UI store.
 */

@singleton()
export class HideStyledTooltipOperation {
  constructor(private readonly tooltipStore: StyledTooltipUiStore) {}

  /**
   * Runs the hide styled tooltip mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.tooltipStore.getStore().hideTooltip();
  }
}

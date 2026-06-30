import { singleton } from 'tsyringe';
import type { StyledTooltipState } from '../../../model/styled-tooltip';
import { StyledTooltipUiStore } from '../../state/ui/styled-tooltip-ui-store';

/**
 * Repositions styled tooltip in the UI store.
 */

@singleton()
export class RepositionStyledTooltipOperation {
  constructor(private readonly tooltipStore: StyledTooltipUiStore) {}

  /**
   * Runs the reposition styled tooltip mutation.
   * @param position Position (Pick<StyledTooltipState, 'x' | 'y'>).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(position: Pick<StyledTooltipState, 'x' | 'y'>): void {
    this.tooltipStore.getStore().repositionTooltip(position);
  }
}

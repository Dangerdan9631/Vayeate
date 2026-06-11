import { singleton } from 'tsyringe';
import { createStore } from 'zustand/vanilla';
import { immer } from 'zustand/middleware/immer';
import type { StyledTooltipState } from '../../../model/styled-tooltip';
import { initialStyledTooltipUiState, type StyledTooltipUiState } from './styled-tooltip-ui-state';

interface StyledTooltipUiStoreState {
  state: StyledTooltipUiState;
  showTooltip: (tooltip: StyledTooltipState) => void;
  hideTooltip: () => void;
  repositionTooltip: (position: Pick<StyledTooltipState, 'x' | 'y'>) => void;
}

/**
 * Zustand store for global styled tooltip visibility and position.
 */
@singleton()
export class StyledTooltipUiStore {
  private store = createStore<StyledTooltipUiStoreState>()(
    immer((set): StyledTooltipUiStoreState => ({
      state: initialStyledTooltipUiState,
      showTooltip: (tooltip: StyledTooltipState) =>
        set((storeState: StyledTooltipUiStoreState) => {
          storeState.state.tooltip = tooltip;
        }),
      hideTooltip: () =>
        set((storeState: StyledTooltipUiStoreState) => {
          storeState.state.tooltip = null;
        }),
      repositionTooltip: (position: Pick<StyledTooltipState, 'x' | 'y'>) =>
        set((storeState: StyledTooltipUiStoreState) => {
          if (!storeState.state.tooltip) return;
          storeState.state.tooltip.x = position.x;
          storeState.state.tooltip.y = position.y;
        }),
    })),
  );

  /**
   * Zustand store API for React subscriptions via viewmodels.
   */
  get api() {
    return this.store;
  }

  /**
   * Returns the current snapshot and mutation methods for domain operations.
   * @returns Live styled tooltip store state and setters.
   */
  getStore(): StyledTooltipUiStoreState {
    return this.store.getState();
  }
}

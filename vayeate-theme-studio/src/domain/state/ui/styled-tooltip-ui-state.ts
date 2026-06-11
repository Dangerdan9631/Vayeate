import type { StyledTooltipState } from '../../../model/styled-tooltip';

/**
 * Global styled tooltip overlay state for the application shell.
 */
export interface StyledTooltipUiState {
  tooltip: StyledTooltipState | null;
}

/**
 * Default tooltip UI state when no tooltip is visible.
 */
export const initialStyledTooltipUiState: StyledTooltipUiState = {
  tooltip: null,
};

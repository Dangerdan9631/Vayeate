import type { StyledTooltipState } from '../../../model/styled-tooltip';

export interface StyledTooltipUiState {
  tooltip: StyledTooltipState | null;
}

export const initialStyledTooltipUiState: StyledTooltipUiState = {
  tooltip: null,
};

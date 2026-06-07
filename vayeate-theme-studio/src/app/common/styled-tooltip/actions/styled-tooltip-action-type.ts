import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import type { AppAction } from '../../../core/action-queue/app-action';

export enum StyledTooltipActionType {
  TooltipSourceOnMouseOver = 'APP_STYLED_TOOLTIP_SOURCE_ON_MOUSE_OVER',
  TooltipSourceOnMouseOut = 'APP_STYLED_TOOLTIP_SOURCE_ON_MOUSE_OUT',
  TooltipOnPositionChange = 'APP_STYLED_TOOLTIP_ON_POSITION_CHANGE',
}

export type AppStyledTooltipActions =
  | { type: StyledTooltipActionType.TooltipSourceOnMouseOver; tooltip: StyledTooltipState }
  | { type: StyledTooltipActionType.TooltipSourceOnMouseOut }
  | { type: StyledTooltipActionType.TooltipOnPositionChange; position: Pick<StyledTooltipState, 'x' | 'y'> };

const styledTooltipTypes = new Set<string>(Object.values(StyledTooltipActionType));

export function isAppStyledTooltipAction(a: AppAction): a is AppStyledTooltipActions {
  return styledTooltipTypes.has(a.type);
}

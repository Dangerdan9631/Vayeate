import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
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

const styledTooltipCoalescers: Partial<Record<StyledTooltipActionType, ActionCoalesceFn>> = {
  [StyledTooltipActionType.TooltipOnPositionChange]: coalesceLatest,
};

export function tryCoalesceAppStyledTooltipAction(
  pending: AppStyledTooltipActions,
  incoming: AppStyledTooltipActions,
): AppStyledTooltipActions | null {
  const coalesce = styledTooltipCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as AppStyledTooltipActions) : null;
}

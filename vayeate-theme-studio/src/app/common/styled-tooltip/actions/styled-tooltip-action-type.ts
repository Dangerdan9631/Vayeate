import type { StyledTooltipState } from '../../../../model/styled-tooltip';
import { coalesceLatest, type ActionCoalesceFn } from '../../../core/action-queue/action-coalesce';
import type { AppAction } from '../../../core/action-queue/app-action';

/**
 * Action type discriminants for the global styled tooltip flow.
 */
export enum StyledTooltipActionType {
  TooltipSourceOnMouseOver = 'APP_STYLED_TOOLTIP_SOURCE_ON_MOUSE_OVER',
  TooltipSourceOnMouseOut = 'APP_STYLED_TOOLTIP_SOURCE_ON_MOUSE_OUT',
  TooltipOnPositionChange = 'APP_STYLED_TOOLTIP_ON_POSITION_CHANGE',
}

/**
 * Union of app actions handled by the styled tooltip handler.
 */
export type AppStyledTooltipActions =
  | { type: StyledTooltipActionType.TooltipSourceOnMouseOver; tooltip: StyledTooltipState }
  | { type: StyledTooltipActionType.TooltipSourceOnMouseOut }
  | { type: StyledTooltipActionType.TooltipOnPositionChange; position: Pick<StyledTooltipState, 'x' | 'y'> };

const styledTooltipTypes = new Set<string>(Object.values(StyledTooltipActionType));

/**
 * Narrows a queued app action to a styled tooltip action when the type matches.
 * @param a Action from the app action queue.
 * @returns True when the action belongs to the styled tooltip union.
 */
export function isAppStyledTooltipAction(a: AppAction): a is AppStyledTooltipActions {
  return styledTooltipTypes.has(a.type);
}

const styledTooltipCoalescers: Partial<Record<StyledTooltipActionType, ActionCoalesceFn>> = {
  [StyledTooltipActionType.TooltipOnPositionChange]: coalesceLatest,
};

/**
 * Merges a pending styled tooltip action with an incoming duplicate when coalescing is configured.
 * @param pending Action already waiting in the queue.
 * @param incoming New action of the same type.
 * @returns The merged action, or null when this type does not coalesce.
 */
export function tryCoalesceAppStyledTooltipAction(
  pending: AppStyledTooltipActions,
  incoming: AppStyledTooltipActions,
): AppStyledTooltipActions | null {
  const coalesce = styledTooltipCoalescers[pending.type];
  return coalesce ? (coalesce(pending, incoming) as AppStyledTooltipActions) : null;
}

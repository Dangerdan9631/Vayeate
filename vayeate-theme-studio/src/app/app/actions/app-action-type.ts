import { AppAction } from '../../core/action-queue/app-action';
import { isAppShellAction, type AppShellActions } from '../app-shell/actions/app-shell-action-type';
import {
  isAppEyedropperOverlayAction,
  tryCoalesceAppEyedropperOverlayAction,
  type AppEyedropperOverlayActions,
} from '../../common/eyedropper-overlay/actions/eyedropper-overlay-action-type';
import {
  isAppStyledTooltipAction,
  tryCoalesceAppStyledTooltipAction,
  type AppStyledTooltipActions,
} from '../../common/styled-tooltip/actions/styled-tooltip-action-type';
import { isAppMenuAction, type AppMenuActions } from '../menu-bar/actions/app-menu-action-type';
import { isAppRibbonAction, type AppRibbonActions } from '../ribbon/actions/app-ribbon-action-type';

/**
 * Union of all app-scoped action types handled by the root app action handler.
 */
export type AppActions =
  | AppShellActions
  | AppEyedropperOverlayActions
  | AppStyledTooltipActions
  | AppMenuActions
  | AppRibbonActions;

/**
 * Narrows a queued action to an app-scoped action when its type belongs to this domain.
 * @param a Action from the global action queue.
 * @returns True when the action is routed through {@link AppActions}.
 */
export function isAppAction(a: AppAction): a is AppActions {
  return isAppShellAction(a)
    || isAppEyedropperOverlayAction(a)
    || isAppStyledTooltipAction(a)
    || isAppMenuAction(a)
    || isAppRibbonAction(a);
}

/**
 * Attempts to merge a pending app action with an incoming one for coalesced dispatch.
 * @param pending Action already queued or in progress.
 * @param incoming Newly dispatched action; must share the same coalescable subdomain as pending.
 * @returns Coalesced action, or null when no coalescing rule applies.
 */
export function tryCoalesceAppAction(pending: AppAction, incoming: AppAction): AppActions | null {
  if (isAppEyedropperOverlayAction(pending) && isAppEyedropperOverlayAction(incoming)) {
    return tryCoalesceAppEyedropperOverlayAction(pending, incoming);
  }
  if (isAppStyledTooltipAction(pending) && isAppStyledTooltipAction(incoming)) {
    return tryCoalesceAppStyledTooltipAction(pending, incoming);
  }
  return null;
}

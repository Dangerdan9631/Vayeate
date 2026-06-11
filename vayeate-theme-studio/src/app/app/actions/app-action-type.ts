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

export type AppActions =
  | AppShellActions
  | AppEyedropperOverlayActions
  | AppStyledTooltipActions
  | AppMenuActions
  | AppRibbonActions;

export function isAppAction(a: AppAction): a is AppActions {
  return isAppShellAction(a)
    || isAppEyedropperOverlayAction(a)
    || isAppStyledTooltipAction(a)
    || isAppMenuAction(a)
    || isAppRibbonAction(a);
}

export function tryCoalesceAppAction(pending: AppAction, incoming: AppAction): AppActions | null {
  if (isAppEyedropperOverlayAction(pending) && isAppEyedropperOverlayAction(incoming)) {
    return tryCoalesceAppEyedropperOverlayAction(pending, incoming);
  }
  if (isAppStyledTooltipAction(pending) && isAppStyledTooltipAction(incoming)) {
    return tryCoalesceAppStyledTooltipAction(pending, incoming);
  }
  return null;
}

import { AppAction } from '../../core/action-queue/app-action';
import { isAppShellAction, type AppShellActions } from '../app-shell/actions/app-shell-action-type';
import { isAppEyedropperOverlayAction, type AppEyedropperOverlayActions } from '../../common/eyedropper-overlay/actions/eyedropper-overlay-action-type';
import { isAppMenuAction, type AppMenuActions } from '../menu-bar/actions/app-menu-action-type';
import { isAppRibbonAction, type AppRibbonActions } from '../ribbon/actions/app-ribbon-action-type';

export type AppActions =
  | AppShellActions
  | AppEyedropperOverlayActions
  | AppMenuActions
  | AppRibbonActions;

export function isAppAction(a: AppAction): a is AppActions {
  return isAppShellAction(a)
    || isAppEyedropperOverlayAction(a)
    || isAppMenuAction(a)
    || isAppRibbonAction(a);
}

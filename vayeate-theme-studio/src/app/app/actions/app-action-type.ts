import { AppAction } from '../../core/components/action-queue/app-action';
import { isAppShellAction, type AppShellActions } from '../components/app-shell/actions/app-shell-action-type';
import { isAppEyedropperOverlayAction, type AppEyedropperOverlayActions } from '../components/eyedropper-overlay/actions/app-eyedropper-overlay-action-type';
import { isAppMenuAction, type AppMenuActions } from '../components/menu-bar/actions/app-menu-action-type';
import { isAppRibbonAction, type AppRibbonActions } from '../components/ribbon/actions/app-ribbon-action-type';

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

import type { AppAction } from '../../core/actions/app-action';
import { isAppBarAction } from '../components/app-bar/actions/app-bar-action-guard';
import { isAppEyedropperOverlayAction } from '../components/eyedropper-overlay/actions/app-eyedropper-overlay-action-guard';
import { isAppMenuAction } from '../components/menu-bar/actions/app-menu-action-guard';
import { isAppRibbonAction } from '../components/ribbon/actions/app-ribbon-action-guard';
import type { AppActions } from './app-action-type';

export function isAppAction(a: AppAction): a is AppActions {
  return isAppBarAction(a)
    || isAppEyedropperOverlayAction(a)
    || isAppMenuAction(a)
    || isAppRibbonAction(a);
}

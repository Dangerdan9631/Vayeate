import type { AppBarActions } from '../components/app-bar/actions/app-bar-action-type';
import type { AppEyedropperOverlayActions } from '../components/eyedropper-overlay/actions/app-eyedropper-overlay-action-type';
import type { AppMenuActions } from '../components/menu-bar/actions/app-menu-action-type';
import type { AppRibbonActions } from '../components/ribbon/actions/app-ribbon-action-type';

export type AppActions =
  | AppBarActions
  | AppEyedropperOverlayActions
  | AppMenuActions
  | AppRibbonActions;

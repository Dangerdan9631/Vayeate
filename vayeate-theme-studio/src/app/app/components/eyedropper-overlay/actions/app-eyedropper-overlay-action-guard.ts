import type { AppAction } from '../../../../core/actions/app-action';
import { AppEyedropperOverlayActions, AppEyedropperOverlayActionType } from './app-eyedropper-overlay-action-type';

const appEyedropperOverlayTypes = new Set<string>(Object.values(AppEyedropperOverlayActionType));

export function isAppEyedropperOverlayAction(a: AppAction): a is AppEyedropperOverlayActions {
  return appEyedropperOverlayTypes.has(a.type);
}
